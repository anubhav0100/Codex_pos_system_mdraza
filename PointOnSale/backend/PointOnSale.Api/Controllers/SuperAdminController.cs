using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Infrastructure.Seeding;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/super")]
[RequirePermission("SUPER_ADMIN")] // Or similar check, for now we rely on seed or existing super admin
public class SuperAdminController(RbacSeeder rbacSeeder) : ControllerBase
{
    [HttpPost("seed/rbac")]
    public async Task<ActionResult<ApiResponse<string>>> SeedRbac([FromQuery] bool allowRevocation = false)
    {
        var result = await rbacSeeder.SeedAsync(allowRevocation);
        return Ok(ApiResponse<string>.Ok(result, "RBAC Seeded Successfully"));
    }
}
