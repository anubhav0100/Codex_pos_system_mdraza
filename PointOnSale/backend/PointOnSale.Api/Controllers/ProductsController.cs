using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Products;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/products")]
public class ProductsController(IProductRepository productRepository) : ControllerBase
{
    [HttpGet]
    [RequirePermission("PRODUCTS_READ")]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetAll()
    {
        var products = await productRepository.GetAllProductsAsync();
        var dtos = products.Select(p => new ProductDto 
        { 
            Id = p.Id, 
            SKU = p.SKU, 
            Name = p.Name, 
            HSN = p.HSN,
            GstPercent = p.GstPercent,
            MRP = p.MRP,
            DefaultSalePrice = p.DefaultSalePrice,
            IsActive = p.IsActive,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? ""
        }).ToList();
        return Ok(ApiResponse<List<ProductDto>>.Ok(dtos));
    }

    [HttpPost]
    [RequirePermission("PRODUCTS_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> Create([FromBody] CreateProductDto dto)
    {
        // Only validation needed: Category existence (optional)
        // SKU uniqueness? Handled by DB constraint usually, but we can check.
        // For now relying on DB.
        
        var product = new Product 
        { 
            SKU = dto.SKU,
            Name = dto.Name,
            HSN = dto.HSN,
            GstPercent = dto.GstPercent,
            MRP = dto.MRP,
            DefaultSalePrice = dto.DefaultSalePrice,
            IsActive = true,
            CategoryId = dto.CategoryId
        };

        try 
        {
            await productRepository.AddAsync(product);
        }
        catch (Exception ex)
        {
             // Check for unique constraint violation manually or via generic handler?
             // Assuming basic flow for now.
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Creation Failed. SKU might be duplicate."), ex.Message));
        }
        
        return Ok(ApiResponse<string>.Ok("Product created successfully"));
    }

    [HttpPut("{id}")]
    [RequirePermission("PRODUCTS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var product = await productRepository.GetByIdAsync(id);
        if (product == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Product not found"), "Not Found"));

        product.SKU = dto.SKU;
        product.Name = dto.Name;
        product.HSN = dto.HSN;
        product.GstPercent = dto.GstPercent;
        product.MRP = dto.MRP;
        product.DefaultSalePrice = dto.DefaultSalePrice;
        product.CategoryId = dto.CategoryId;

        await productRepository.UpdateAsync(product);
        return Ok(ApiResponse<string>.Ok("Product updated successfully"));
    }

    [HttpDelete("{id}")]
    [RequirePermission("PRODUCTS_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
    {
        var product = await productRepository.GetByIdAsync(id);
        if (product == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Product not found"), "Not Found"));

        try
        {
            await productRepository.DeleteAsync(product);
        }
        catch (Exception)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Cannot delete product (likely in use)"), "Deletion Failed"));
        }
        return Ok(ApiResponse<string>.Ok("Product deleted successfully"));
    }

    [HttpPatch("{id}/activate")]
    [RequirePermission("PRODUCTS_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Activate(int id)
    {
        var product = await productRepository.GetByIdAsync(id);
        if (product == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Product not found"), "Not Found"));

        if (!product.IsActive)
        {
            product.IsActive = true;
            await productRepository.UpdateAsync(product);
        }
        return Ok(ApiResponse<string>.Ok("Product activated"));
    }

    [HttpPatch("{id}/deactivate")]
    [RequirePermission("PRODUCTS_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Deactivate(int id)
    {
        var product = await productRepository.GetByIdAsync(id);
        if (product == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Product not found"), "Not Found"));

        if (product.IsActive)
        {
            product.IsActive = false;
            await productRepository.UpdateAsync(product);
        }
        return Ok(ApiResponse<string>.Ok("Product deactivated"));
    }
}
