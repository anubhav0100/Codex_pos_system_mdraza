using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.CompanyAdmins;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/super")]
[RequirePermission("SUPER_ADMIN")]
public class SuperCompanyAdminsController(
    IUserRepository userRepository,
    ICompanyRepository companyRepository,
    IScopeRepository scopeRepository,
    IRoleRepository roleRepository) : ControllerBase
{
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    [HttpPost("companies/{companyId}/admins")]
    [RequirePermission("COMPANY_ADMINS_CREATE")]
    [RequirePermission("USERS_CREATE")]
    public async Task<ActionResult<ApiResponse<dynamic>>> Create(int companyId, [FromBody] CreateCompanyAdminDto dto)
    {
        var company = await companyRepository.GetByIdAsync(companyId);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        // Get Root Scope
        var rootScope = (await scopeRepository.GetAllByCompanyIdAsync(companyId))
            .FirstOrDefault(s => s.ParentScopeNodeId == null);
        
        if (rootScope == null)
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Company Root Scope not found. Data inconsistency."), "Company Root Scope not found"));

        // Get Role
        var role = await roleRepository.GetByCodeAsync("CompanyAdmin");
        if (role == null)
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("500", "CompanyAdmin Role not found in system"), "Role configuration error"));

        // Check Email
        var existingUser = await userRepository.GetByEmailWithRolesAsync(dto.Email);
        if (existingUser != null)
            return Conflict(ApiResponse<string>.Fail(new ErrorDetail("409", "Email already exists"), "Email already exists"));

        // Create User
        var tempPassword = Guid.NewGuid().ToString("N").Substring(0, 10) + "A1!"; // Simple logic for now
        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            ScopeNodeId = rootScope.Id,
            UserRoles = new List<UserRole> { new() { RoleId = role.Id } }
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);

        await userRepository.AddAsync(user);

        return Ok(ApiResponse<dynamic>.Ok(new { UserId = user.Id, TemporaryPassword = tempPassword }, "Company Admin created successfully"));
    }

    [HttpGet("companies/{companyId}/admins")]
    [RequirePermission("COMPANY_ADMINS_READ")]
    [RequirePermission("USERS_READ")]
    public async Task<ActionResult<ApiResponse<List<CompanyAdminDto>>>> GetAll(int companyId)
    {
        var users = await userRepository.GetAllCompanyAdminsAsync(companyId);

        var dtos = users.Select(u => new CompanyAdminDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            CompanyId = companyId
        }).ToList();

        return Ok(ApiResponse<List<CompanyAdminDto>>.Ok(dtos));
    }

    [HttpPut("company-admins/{userId}")]
    [RequirePermission("COMPANY_ADMINS_UPDATE")]
    [RequirePermission("USERS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> Update(int userId, [FromBody] UpdateCompanyAdminDto dto)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));

        // Ensure user is actually a Company Admin? 
        // For simplicity, we assume GetByIdAsync returns global user, but maybe we should check if they are Company Admin if we want to be strict.
        // But the user ID is unique.
        
        user.FullName = dto.FullName;
        user.Phone = dto.Phone;

        await userRepository.UpdateAsync(user);
        return Ok(ApiResponse<string>.Ok("User updated successfully"));
    }

    [HttpPatch("company-admins/{userId}/activate")]
    [RequirePermission("COMPANY_ADMINS_ACTIVATE")]
    [RequirePermission("USERS_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Activate(int userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));

        if (!user.IsActive)
        {
            user.IsActive = true;
            await userRepository.UpdateAsync(user);
        }
        return Ok(ApiResponse<string>.Ok("User activated successfully"));
    }

    [HttpPatch("company-admins/{userId}/deactivate")]
    [RequirePermission("COMPANY_ADMINS_ACTIVATE")]
    [RequirePermission("USERS_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Deactivate(int userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "User not found"), "User not found"));

        if (user.IsActive)
        {
            user.IsActive = false;
            await userRepository.UpdateAsync(user);
        }
        return Ok(ApiResponse<string>.Ok("User deactivated successfully"));
    }
}
