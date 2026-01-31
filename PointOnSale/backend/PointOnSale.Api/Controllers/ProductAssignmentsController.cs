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
    IScopeRepository scopeRepository, // Helper to verify scope existence
    PointOnSale.Infrastructure.Data.PosDbContext dbContext // Injecting DbContext for stock join if needed or simple fetch
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
    [RequirePermission("PRODUCT_ASSIGNMENTS_MANAGE")]
    [Filters.AuditLog]
    public async Task<ActionResult<ApiResponse<string>>> Assign([FromBody] ProductAssignmentDto dto)
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

    // Bulk Assign Products
    [HttpPost("product-assignments/assign-bulk")]
    [RequirePermission("PRODUCT_ASSIGNMENTS_MANAGE")]
    [Filters.AuditLog]
    public async Task<ActionResult<ApiResponse<string>>> AssignBulk([FromBody] BulkAssignProductDto dto)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, dto.ScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Scope"), "Forbidden"));

        if (dto.Assignments == null || !dto.Assignments.Any())
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "No products selected"), "No Products"));

        int successCount = 0;
        int failCount = 0;
        int updatedCount = 0;

        foreach (var item in dto.Assignments)
        {
            try 
            {
                // Check if exists
                var existing = await productRepository.GetAssignmentAsync(dto.ScopeNodeId, item.ProductId);
                if (existing == null)
                {
                    var assignment = new ProductAssignment
                    {
                        ScopeNodeId = dto.ScopeNodeId,
                        ProductId = item.ProductId,
                        IsAllowed = dto.IsAllowed,
                        PriceOverride = item.PriceOverride
                    };
                    await productRepository.AddAssignmentAsync(assignment);
                    successCount++;
                }
                else if (dto.UpdateExisting)
                {
                    // Update existing assignment
                    existing.IsAllowed = dto.IsAllowed;
                    existing.PriceOverride = item.PriceOverride;
                    await productRepository.UpdateAssignmentAsync(existing);
                    updatedCount++;
                }
                else
                {
                    failCount++; // Already exists and update not requested
                }
            }
            catch
            {
                failCount++;
            }
        }

        return Ok(ApiResponse<string>.Ok($"Processed assignments. Created: {successCount}, Updated: {updatedCount}, Skipped/Failed: {failCount}."));
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
        
        // Fetch all stock balances for this scope to map to DTOs
        var stockBalances = await dbContext.StockBalances
            .Where(sb => sb.ScopeNodeId == scopeNodeId)
            .ToDictionaryAsync(sb => sb.ProductId, sb => sb.QtyOnHand);

        var dtos = assignments.Select(a => new ProductAssignmentDto
        {
            ScopeNodeId = a.ScopeNodeId,
            Id = a.ProductId, // Use ProductId as Id
            ProductId = a.ProductId,
            Name = a.Product?.Name ?? "Unknown",
            Sku = a.Product?.SKU ?? "",
            ProductMRP = a.Product?.MRP ?? 0,
            DefaultSalePrice = a.Product?.DefaultSalePrice ?? 0,
            CategoryName = a.Product?.Category?.Name ?? "General",
            GstPercent = a.Product?.GstPercent ?? 0,
            IsAllowed = a.IsAllowed,
            PriceOverride = a.PriceOverride,
            EffectivePrice = a.PriceOverride ?? a.Product?.DefaultSalePrice ?? 0,
            StockOnHand = stockBalances.GetValueOrDefault(a.ProductId, 0)
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
