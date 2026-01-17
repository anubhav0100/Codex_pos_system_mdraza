using PointOnSale.Application.DTOs;

namespace PointOnSale.Application.Interfaces;

public interface IProductService
{
    Task<ProductDto> CreateAsync(CreateProductDto input, CancellationToken cancellationToken = default);
}
