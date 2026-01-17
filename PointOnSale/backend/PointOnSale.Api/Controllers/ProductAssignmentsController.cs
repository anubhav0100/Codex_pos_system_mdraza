using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Products;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1")]
public class ProductAssignmentsController(
    IProductRepository productRepository, 
    IScopeAccessService scopeAccessService,
    IScopeRepository scopeRepository // Helper to verify scope existence
    ) : ControllerBase
{
    private int GetUserScopeId()
    {
        var claim = User.FindFirst("ScopeNodeId");
        if (claim != null && int.TryParse(claim.Value, out int id))
        {
            return id;
        }
        return 0; // SuperAdmin or no scope
    }

    // Assign Product
    [HttpPost("product-assignments/assign")]
    [RequirePermission("PRODUCT_ASSIGNMENTS_ASSIGN")]
    public async Task<ActionResult<ApiResponse<string>>> Assign([FromBody] AssignProductDto dto)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, dto.ScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        // Check if exists
        var existing = await productRepository.GetAssignmentAsync(dto.ScopeNodeId, dto.ProductId);
        if (existing != null)
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Product already assigned to this scope. Use Update."), "Duplicate Assignment"));

        // Verify Product and Scope exist? 
        // Repository Add will fail FK if not exist, but let's be cleaner if needed.
        // Assuming clean input for now to save DB calls, or catch FK exception.

        var assignment = new ProductAssignment
        {
            ScopeNodeId = dto.ScopeNodeId,
            ProductId = dto.ProductId,
            IsAllowed = dto.IsAllowed,
            PriceOverride = dto.PriceOverride
        };

        try
        {
            await productRepository.AddAssignmentAsync(assignment);
        }
        catch (Exception ex)
        {
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Failed to assign. Check Product/Scope ID."), ex.Message));
        }

        return Ok(ApiResponse<string>.Ok("Product assigned successfully"));
    }

    // List by Scope
    [HttpGet("scopes/{scopeNodeId}/products")]
    [RequirePermission("PRODUCT_ASSIGNMENTS_READ")]
    public async Task<ActionResult<ApiResponse<List<ProductAssignmentDto>>>> GetByScope(int scopeNodeId)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, scopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        var assignments = await productRepository.GetAssignmentsByScopeAsync(scopeNodeId);
        
        var dtos = assignments.Select(a => new ProductAssignmentDto
        {
            ScopeNodeId = a.ScopeNodeId,
            ProductId = a.ProductId,
            ProductName = a.Product?.Name ?? "Unknown",
            ProductSKU = a.Product?.SKU ?? "",
            ProductMRP = a.Product?.MRP ?? 0,
            ProductDefaultSalePrice = a.Product?.DefaultSalePrice ?? 0,
            IsAllowed = a.IsAllowed,
            PriceOverride = a.PriceOverride,
            EffectivePrice = a.PriceOverride ?? a.Product?.DefaultSalePrice ?? 0
        }).ToList();

        return Ok(ApiResponse<List<ProductAssignmentDto>>.Ok(dtos));
    }

    // Update
    [HttpPut("product-assignments/{scopeNodeId}/{productId}")]
    [RequirePermission("PRODUCT_ASSIGNMENTS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> Update(int scopeNodeId, int productId, [FromBody] UpdateProductAssignmentDto dto)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, scopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        var assignment = await productRepository.GetAssignmentAsync(scopeNodeId, productId);
        if (assignment == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Assignment not found"), "Not Found"));

        assignment.IsAllowed = dto.IsAllowed;
        assignment.PriceOverride = dto.PriceOverride;

        await productRepository.UpdateAssignmentAsync(assignment);
        return Ok(ApiResponse<string>.Ok("Assignment updated successfully"));
    }

    // Delete
    [HttpDelete("product-assignments/{scopeNodeId}/{productId}")]
    [RequirePermission("PRODUCT_ASSIGNMENTS_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int scopeNodeId, int productId)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, scopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        var assignment = await productRepository.GetAssignmentAsync(scopeNodeId, productId);
        if (assignment == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Assignment not found"), "Not Found"));

        await productRepository.DeleteAssignmentAsync(assignment);
        return Ok(ApiResponse<string>.Ok("Assignment removed successfully"));
    }
}
