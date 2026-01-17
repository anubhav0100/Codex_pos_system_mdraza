using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Reports;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/audit-logs")]
public class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    [RequirePermission("AUDIT_LOGS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetLogs(
        [FromQuery] int? userId, 
        [FromQuery] string? entity, 
        [FromQuery] string? action, 
        [FromQuery] DateTime? dateFrom, 
        [FromQuery] DateTime? dateTo)
    {
        var logs = await auditLogService.GetLogsAsync(userId, entity, action, dateFrom, dateTo);
        return Ok(ApiResponse<List<AuditLogDto>>.Ok(logs));
    }
}
