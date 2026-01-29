using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PointOnSale.Application.DTOs.Auth;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Constants;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IConfiguration configuration) : IAuthService
{
    private readonly PasswordHasher<AppUser> _passwordHasher = new();

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByEmailWithRolesAsync(request.Email, cancellationToken);
        if (user == null)
        {
            throw new Exception("Invalid credentials"); // Global Exception Middleware will handle, or custom exception
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
             throw new Exception("Invalid credentials");
        }

        if (!user.IsActive)
        {
             throw new Exception("User is inactive");
        }

        // Build Permissions
        var roles = user.UserRoles.Select(ur => ur.Role.Code).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        // Scope info
        var scopeNodeId = user.ScopeNodeId;
        var scopeType = user.ScopeNode?.ScopeType;
        var companyId = user.ScopeNode?.CompanyId ?? 0;

        // Generate Token
        var token = GenerateJwtToken(user, roles, scopeNodeId, scopeType, companyId);

        var profile = new UserProfileDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            ScopeNodeId = scopeNodeId,
            ScopeType = scopeType,
            CompanyId = companyId,
            Roles = roles,
            Permissions = permissions
        };

        return new LoginResponse(token, profile);
    }

    private string GenerateJwtToken(AppUser user, List<string> roles, int? scopeNodeId, Domain.Enums.ScopeType? scopeType, int companyId)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("companyId", companyId.ToString()),
        };

        if (scopeNodeId.HasValue) claims.Add(new("ScopeNodeId", scopeNodeId.Value.ToString()));
        if (scopeType.HasValue) claims.Add(new("scopeType", scopeType.Value.ToString()));

        foreach (var role in roles)
        {
            claims.Add(new(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpMinutes"]!)),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
