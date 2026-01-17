using Microsoft.AspNetCore.Mvc;
using PointOnSale.Application.DTOs;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create(CreateProductDto input, CancellationToken cancellationToken)
    {
        var created = await productService.CreateAsync(input, cancellationToken);
        return Ok(ApiResponse<ProductDto>.Ok(created, "Product created"));
    }
}
