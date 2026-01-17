using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Users;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/users")]
public class UsersController(
    IUserRepository userRepository,
    IScopeRepository scopeRepository,
    IRoleRepository roleRepository,
    IScopeAccessService scopeAccessService) : ControllerBase
{
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    private int GetUserScopeId()
    {
        // Typically extracting from Claims. Assuming "scopeId" claim or similar.
        // If not present, we might look up via user ID, but token should have context.
        // For SuperAdmin, this might vary.
        // Let's assume we extract "scopeId" claim.
        var claim = User.Claims.FirstOrDefault(c => c.Type == "scopeId");
        if (claim != null && int.TryParse(claim.Value, out int id))
        {
            return id;
        }
        // Fallback: SuperAdmin might not have a fix scope or treats as 0 (Global).
        // But for hierarchy checks, we need a node. If SuperAdmin, we assume they have access to everything.
        if (User.IsInRole("SuperAdmin")) return 0; 
        
        return -1; // Invalid
    }

    [HttpPost]
    [RequirePermission("USERS_CREATE")]
    [Filters.AuditLog]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create([FromBody] CreateUserDto dto)
    {
        int myScopeId = GetUserScopeId();
        
        // 1. Check Access to Target Scope
        // If SuperAdmin (myScopeId == 0), allowed.
        if (myScopeId != 0)
        {
             if (!await scopeAccessService.CanAccessScopeAsync(myScopeId, dto.ScopeNodeId))
                 return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Cannot create user in this scope"), "Forbidden"));
        }

        var targetScope = await scopeRepository.GetByIdAsync(dto.ScopeNodeId);
        if (targetScope == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Scope not found"), "Scope not found"));

        // 2. Validate Roles
        if (dto.RoleIds.Any())
        {
            var roles = await roleRepository.GetByIdsAsync(dto.RoleIds);
            if (roles.Count != dto.RoleIds.Count)
                 return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "One or more roles invalid"), "Invalid Roles"));

            // Check Role ScopeType Compatibility
            foreach (var role in roles)
            {
                if (role.ScopeType != targetScope.ScopeType)
                     return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", $"Role {role.Name} is not compatible with Scope Type {targetScope.ScopeType}"), "Role Mismatch"));
            }
        }

        // 3. Check Email
        var existingUser = await userRepository.GetByEmailWithRolesAsync(dto.Email);
        if (existingUser != null)
            return Conflict(ApiResponse<string>.Fail(new ErrorDetail("409", "Email already exists"), "Email already exists"));

        // 4. Create User
        var tempPassword = Guid.NewGuid().ToString("N").Substring(0, 10) + "A1!";
        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            ScopeNodeId = dto.ScopeNodeId,
            UserRoles = dto.RoleIds.Select(rid => new UserRole { RoleId = rid }).ToList()
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);

        await userRepository.AddAsync(user);

        return Ok(ApiResponse<dynamic>.Ok(new { UserId = user.Id, TemporaryPassword = tempPassword }, "User created successfully"));
    }

    [HttpGet]
    [RequirePermission("USERS_READ")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAll([FromQuery] int scopeNodeId)
    {
        int myScopeId = GetUserScopeId();

        // 1. Check Access
        if (myScopeId != 0)
        {
            // Can only view users in scopes I have access to
            if (!await scopeAccessService.CanAccessScopeAsync(myScopeId, scopeNodeId))
                 return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Cannot access this scope"), "Forbidden"));
        }

        var users = await userRepository.GetAllByScopeIdAsync(scopeNodeId);

        var dtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            IsActive = u.IsActive,
            ScopeNodeId = u.ScopeNodeId,
            CreatedAt = u.CreatedAt,
            Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
        }).ToList();

        return Ok(ApiResponse<List<UserDto>>.Ok(dtos));
    }

    [HttpPut("{id}")]
    [RequirePermission("USERS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));

        int myScopeId = GetUserScopeId();
        if (myScopeId != 0)
        {
             // If user has no scope, it's a data anomaly or system user, but we can't check scope access on null. 
             // Assuming strict hierarchy, target user MUST have scope.
             if (!user.ScopeNodeId.HasValue || !await scopeAccessService.CanAccessScopeAsync(myScopeId, user.ScopeNodeId.Value))
                 return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Cannot modify user in this scope"), "Forbidden"));
        }

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;

        await userRepository.UpdateAsync(user);
        return Ok(ApiResponse<string>.Ok("User updated successfully"));
    }

    [HttpPatch("{id}/activate")]
    [RequirePermission("USERS_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Activate(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0)
        {
             if (!user.ScopeNodeId.HasValue || !await scopeAccessService.CanAccessScopeAsync(myScopeId, user.ScopeNodeId.Value))
                 return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Cannot modify user in this scope"), "Forbidden"));
        }

        if (!user.IsActive)
        {
            user.IsActive = true;
            await userRepository.UpdateAsync(user);
        }
        return Ok(ApiResponse<string>.Ok("User activated"));
    }

    [HttpPatch("{id}/deactivate")]
    [RequirePermission("USERS_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Deactivate(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0)
        {
             if (!user.ScopeNodeId.HasValue || !await scopeAccessService.CanAccessScopeAsync(myScopeId, user.ScopeNodeId.Value))
                 return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Cannot modify user in this scope"), "Forbidden"));
        }

        if (user.IsActive)
        {
            user.IsActive = false;
            await userRepository.UpdateAsync(user);
        }
        return Ok(ApiResponse<string>.Ok("User deactivated"));
    }

    [HttpPost("{id}/roles")]
    [RequirePermission("USERS_UPDATE")] // Or specific permission
    public async Task<ActionResult<ApiResponse<string>>> AssignRoles(int id, [FromBody] AssignRolesDto dto)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));

        int myScopeId = GetUserScopeId();
        if (myScopeId != 0)
        {
             if (!user.ScopeNodeId.HasValue || !await scopeAccessService.CanAccessScopeAsync(myScopeId, user.ScopeNodeId.Value))
                 return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Cannot modify user in this scope"), "Forbidden"));
        }

        if (!user.ScopeNodeId.HasValue) 
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "User has no scope assigned"), "Invalid User State"));

        var targetScope = await scopeRepository.GetByIdAsync(user.ScopeNodeId.Value);
        if (targetScope == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Scope not found"), "Scope not found"));

        // Validate Roles
        var roles = await roleRepository.GetByIdsAsync(dto.RoleIds);
        if (roles.Count != dto.RoleIds.Count)
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "One or more roles invalid"), "Invalid Roles"));

        foreach (var role in roles)
        {
            if (role.ScopeType != targetScope.ScopeType)
                 return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", $"Role {role.Name} is not compatible with User Scope Type {targetScope.ScopeType}"), "Role Mismatch"));
        }

        await userRepository.UpdateUserRolesAsync(id, dto.RoleIds);

        return Ok(ApiResponse<string>.Ok("Roles updated successfully"));
    }
}
