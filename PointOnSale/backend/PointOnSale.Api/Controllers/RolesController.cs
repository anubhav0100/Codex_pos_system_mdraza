using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Roles;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Enums;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/roles")]
public class RolesController(IRoleRepository roleRepository) : ControllerBase
{
    [HttpGet]
    [RequirePermission("USERS_READ")]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetAll([FromQuery] int? scopeType)
    {
        ScopeType? parsedScopeType = null;
        if (scopeType.HasValue)
        {
            if (!Enum.IsDefined(typeof(ScopeType), scopeType.Value))
            {
                return BadRequest(ApiResponse<string>.Fail(
                    new ErrorDetail("400", "Invalid scope type"),
                    "Invalid scope type"));
            }
            parsedScopeType = (ScopeType)scopeType.Value;
        }

        var roles = await roleRepository.GetAllAsync(parsedScopeType);
        var dtos = roles.Select(role => new RoleDto
        {
            Id = role.Id,
            Code = role.Code,
            Name = role.Name,
            Description = role.Description,
            ScopeType = (int)role.ScopeType
        }).ToList();

        return Ok(ApiResponse<List<RoleDto>>.Ok(dtos));
    }
}
