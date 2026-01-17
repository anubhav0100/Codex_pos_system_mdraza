using PointOnSale.Application.DTOs;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Services;

public class ProductService(IProductRepository repository) : IProductService
{
    public async Task<ProductDto> CreateAsync(CreateProductDto input, CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            Name = input.Name,
            DefaultSalePrice = input.Price,
            SKU = Guid.NewGuid().ToString().Substring(0, 8), // Temp unique SKU
            HSN = "0000",
            IsActive = true
        };

        var saved = await repository.AddAsync(product, cancellationToken);
        return new ProductDto(saved.Id, saved.Name, saved.DefaultSalePrice);
    }
}
