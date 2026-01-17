using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Inventory;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Enums;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/inventory")]
public class InventoryController(
    IInventoryService inventoryService,
    IInventoryRepository inventoryRepository,
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

    [HttpGet("balance")]
    [RequirePermission("INVENTORY_VIEW")]
    public async Task<ActionResult<ApiResponse<List<InventoryBalanceDto>>>> GetBalance([FromQuery] int scopeNodeId)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, scopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        var balances = await inventoryRepository.GetBalancesByScopeAsync(scopeNodeId);
        var dtos = balances.Select(b => new InventoryBalanceDto
        {
            ScopeNodeId = b.ScopeNodeId,
            ProductId = b.ProductId,
            ProductName = b.Product?.Name ?? "Unknown",
            ProductSKU = b.Product?.SKU ?? "",
            QtyOnHand = b.QtyOnHand
        }).ToList();

        return Ok(ApiResponse<List<InventoryBalanceDto>>.Ok(dtos));
    }

    [HttpGet("ledger")]
    [RequirePermission("INVENTORY_VIEW")]
    public async Task<ActionResult<ApiResponse<List<InventoryLedgerDto>>>> GetLedger([FromQuery] int scopeNodeId, [FromQuery] int? productId)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, scopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        var ledger = await inventoryRepository.GetLedgerAsync(scopeNodeId, productId);
        var dtos = ledger.Select(l => new InventoryLedgerDto
        {
            Id = l.Id,
            ScopeNodeId = l.ScopeNodeId,
            ProductId = l.ProductId,
            ProductName = l.Product?.Name ?? "Unknown",
            QtyChange = l.QtyChange,
            TxnType = l.TxnType.ToString(),
            RefType = l.RefType,
            RefId = l.RefId,
            CreatedAt = l.CreatedAt
        }).ToList();

        return Ok(ApiResponse<List<InventoryLedgerDto>>.Ok(dtos));
    }

    [HttpPost("adjust")]
    [RequirePermission("INVENTORY_ADJUST")]
    public async Task<ActionResult<ApiResponse<string>>> AdjustStock([FromBody] AdjustInventoryDto dto)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, dto.ScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        try
        {
            await inventoryService.AddStockMovementAsync(
                dto.ScopeNodeId,
                dto.ProductId,
                dto.QtyChange,
                StockTxnType.Adjustment,
                "Manual",
                dto.Notes ?? "Manual Adjustment",
                allowNegative: true // Adjustments can force negative? Requirement says "Prevention unless INVENTORY_ADJUST". 
                                    // Since this endpoint IS protected by INVENTORY_ADJUST, we allow negative.
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Validation Failed"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail(new ErrorDetail("500", "Adjustment failed"), ex.Message));
        }

        return Ok(ApiResponse<string>.Ok("Stock adjusted successfully"));
    }
}
