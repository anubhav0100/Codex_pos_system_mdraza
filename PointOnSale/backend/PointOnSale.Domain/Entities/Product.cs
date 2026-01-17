using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Active;
}
