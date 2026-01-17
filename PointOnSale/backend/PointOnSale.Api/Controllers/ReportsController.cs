using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Reports;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/reports")]
public class ReportsController(
    IReportsService reportsService,
    IScopeAccessService scopeAccessService
    ) : ControllerBase
{
    private int GetUserScopeId()
    {
        var claim = User.FindFirst("ScopeNodeId");
        if (claim != null && int.TryParse(claim.Value, out int id)) return id;
        return 0;
    }

    private async Task<bool> ProcessScopeAccess(int targetScopeId)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId == 0) return true; // SuperAdmin
        if (await scopeAccessService.CanAccessScopeAsync(myScopeId, targetScopeId)) return true;
        return false;
    }

    [HttpGet("stock-balance")]
    [RequirePermission("REPORTS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<StockBalanceReportDto>>>> GetStockBalance([FromQuery] int scopeNodeId)
    {
        if (!await ProcessScopeAccess(scopeNodeId)) return StatusCode(403, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));
        var data = await reportsService.GetStockBalanceAsync(scopeNodeId);
        return Ok(ApiResponse<List<StockBalanceReportDto>>.Ok(data));
    }

    [HttpGet("sales-summary")]
    [RequirePermission("REPORTS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<SalesSummaryDto>>>> GetSalesSummary([FromQuery] int scopeNodeId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        if (!await ProcessScopeAccess(scopeNodeId)) return StatusCode(403, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));
        var data = await reportsService.GetSalesSummaryAsync(scopeNodeId, dateFrom, dateTo);
        return Ok(ApiResponse<List<SalesSummaryDto>>.Ok(data));
    }

    [HttpGet("top-products")]
    [RequirePermission("REPORTS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<TopProductDto>>>> GetTopProducts([FromQuery] int scopeNodeId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        if (!await ProcessScopeAccess(scopeNodeId)) return StatusCode(403, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));
        var data = await reportsService.GetTopProductsAsync(scopeNodeId, dateFrom, dateTo);
        return Ok(ApiResponse<List<TopProductDto>>.Ok(data));
    }

    [HttpGet("wallet-summary")]
    [RequirePermission("REPORTS_VIEW")]
    public async Task<ActionResult<ApiResponse<WalletSummaryDto>>> GetWalletSummary([FromQuery] int scopeNodeId)
    {
        if (!await ProcessScopeAccess(scopeNodeId)) return StatusCode(403, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));
        var data = await reportsService.GetWalletSummaryAsync(scopeNodeId);
        return Ok(ApiResponse<WalletSummaryDto>.Ok(data));
    }

    [HttpGet("stock-requests-summary")]
    [RequirePermission("REPORTS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<StockRequestSummaryDto>>>> GetStockRequestsSummary([FromQuery] int scopeNodeId, [FromQuery] string? status)
    {
         if (!await ProcessScopeAccess(scopeNodeId)) return StatusCode(403, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));
         var data = await reportsService.GetStockRequestsSummaryAsync(scopeNodeId, status);
         return Ok(ApiResponse<List<StockRequestSummaryDto>>.Ok(data));
    }
}
