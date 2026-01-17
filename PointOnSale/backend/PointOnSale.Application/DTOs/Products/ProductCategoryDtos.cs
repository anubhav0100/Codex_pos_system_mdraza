using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Products;

public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class CreateProductCategoryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
}

public class UpdateProductCategoryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
}
