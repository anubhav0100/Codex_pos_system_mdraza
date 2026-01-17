using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Products;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/product-categories")]
public class ProductCategoriesController(IProductRepository productRepository) : ControllerBase
{
    [HttpGet]
    [RequirePermission("PRODUCT_CATEGORIES_READ")] // Assuming READ permissions exists or mapped to VIEW
    public async Task<ActionResult<ApiResponse<List<ProductCategoryDto>>>> GetAll()
    {
        var categories = await productRepository.GetAllCategoriesAsync();
        var dtos = categories.Select(c => new ProductCategoryDto { Id = c.Id, Name = c.Name }).ToList();
        return Ok(ApiResponse<List<ProductCategoryDto>>.Ok(dtos));
    }

    [HttpPost]
    [RequirePermission("PRODUCT_CATEGORIES_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> Create([FromBody] CreateProductCategoryDto dto)
    {
        var category = new ProductCategory { Name = dto.Name };
        await productRepository.AddCategoryAsync(category);
        return Ok(ApiResponse<string>.Ok("Category created successfully"));
    }

    [HttpPut("{id}")]
    [RequirePermission("PRODUCT_CATEGORIES_UPDATE")] // Mapped to EDIT
    public async Task<ActionResult<ApiResponse<string>>> Update(int id, [FromBody] UpdateProductCategoryDto dto)
    {
        var category = await productRepository.GetCategoryByIdAsync(id);
        if (category == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Category not found"), "Not Found"));

        category.Name = dto.Name;
        await productRepository.UpdateCategoryAsync(category);
        return Ok(ApiResponse<string>.Ok("Category updated successfully"));
    }

    [HttpDelete("{id}")]
    [RequirePermission("PRODUCT_CATEGORIES_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
    {
        var category = await productRepository.GetCategoryByIdAsync(id);
        if (category == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Category not found"), "Not Found"));

        try
        {
            await productRepository.DeleteCategoryAsync(category);
        }
        catch (Exception)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Cannot delete category in use"), "Deletion Failed"));
        }
        return Ok(ApiResponse<string>.Ok("Category deleted successfully"));
    }
}
