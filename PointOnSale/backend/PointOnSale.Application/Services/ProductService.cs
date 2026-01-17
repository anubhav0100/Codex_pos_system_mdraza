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
            Id = Guid.NewGuid(),
            Name = input.Name,
            Price = input.Price
        };

        var saved = await repository.AddAsync(product, cancellationToken);
        return new ProductDto(saved.Id, saved.Name, saved.Price);
    }
}
