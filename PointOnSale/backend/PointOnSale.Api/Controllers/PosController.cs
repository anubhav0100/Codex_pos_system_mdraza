using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Pos;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/pos")]
public class PosController(
    IPosService posService,
    IScopeAccessService scopeAccessService
    ) : ControllerBase
{
    private int GetUserScopeId()
    {
        var claim = User.FindFirst("ScopeNodeId");
        if (claim != null && int.TryParse(claim.Value, out int id))
        {
            return id;
        }
        return 0; 
    }

    [HttpPost("sales")]
    [RequirePermission("POS_SALES_CREATE")]
    [Filters.AuditLog]
    public async Task<ActionResult<ApiResponse<SalesOrderDto>>> CreateSale([FromBody] CreateSaleDto dto)
    {
        int myScopeId = GetUserScopeId();
        
        // Ensure user can access the scope where sale is being made
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, dto.ScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        try
        {
            var result = await posService.CreateSaleAsync(dto);
            return CreatedAtAction(nameof(GetSale), new { id = result.Id }, ApiResponse<SalesOrderDto>.Ok(result));
        }
        catch (InvalidOperationException ex)
        {
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Validation Failed"));
        }
    }

    [HttpGet("sales/{id}")]
    [RequirePermission("POS_SALES_VIEW")]
    public async Task<ActionResult<ApiResponse<SalesOrderDto>>> GetSale(int id)
    {
        int myScopeId = GetUserScopeId();
        var sale = await posService.GetSaleAsync(id);
        
        if (sale == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Sale not found"), "Not Found"));

        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, sale.ScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        return Ok(ApiResponse<SalesOrderDto>.Ok(sale));
    }

    [HttpGet("sales")]
    [RequirePermission("POS_SALES_VIEW")]
    public async Task<ActionResult<ApiResponse<List<SalesOrderDto>>>> GetSales(
        [FromQuery] int scopeNodeId, 
        [FromQuery] DateTime? dateFrom, 
        [FromQuery] DateTime? dateTo)
    {
        int myScopeId = GetUserScopeId();
        
        // If User Scope is not 0 (SuperAdmin), ensure they are requesting for their scope or a child
        // If scopeNodeId is not provided, defaulting to myScopeId might be safer or reject?
        // Let's enforce scopeNodeId required for now or default to myScopeId if present.
        
        int targetScope = scopeNodeId == 0 ? myScopeId : scopeNodeId;
        if (targetScope == 0) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "ScopeNodeId required"), "Bad Request"));
        
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, targetScope))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        var sales = await posService.GetSalesAsync(targetScope, dateFrom, dateTo);
        return Ok(ApiResponse<List<SalesOrderDto>>.Ok(sales));
    }

    [HttpPost("sales/{id}/confirm-payment")]
    [RequirePermission("POS_SALES_CONFIRMPAYMENT")]
    public async Task<ActionResult<ApiResponse<SalesOrderDto>>> ConfirmPayment(int id, [FromBody] ConfirmPaymentDto dto)
    {
        int myScopeId = GetUserScopeId();
        
        // Need to check scope access. Get sale first.
        var sale = await posService.GetSaleAsync(id);
        if (sale == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Sale not found"), "Not Found"));
        
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, sale.ScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        try
        {
            var result = await posService.ConfirmPaymentAsync(id, dto);
            return Ok(ApiResponse<SalesOrderDto>.Ok(result));
        }
        catch (InvalidOperationException ex)
        {
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Validation Failed"));
        }
         catch (Exception ex)
        {
             return StatusCode(500, ApiResponse<string>.Fail(new ErrorDetail("500", "Payment Confirmation Failed"), ex.Message));
        }
    }
}
