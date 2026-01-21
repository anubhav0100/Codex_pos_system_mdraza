using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public string SKU { get; set; }
    public string Name { get; set; }
    public string HSN { get; set; }
    public decimal GstPercent { get; set; }
    public decimal MRP { get; set; }
    public decimal DefaultSalePrice { get; set; }
    public bool IsActive { get; set; }
    
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}

public class CreateProductDto
{
    [Required]
    [MaxLength(50)]
    public string SKU { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; }
    
    [MaxLength(20)]
    public string HSN { get; set; }
    
    [Range(0, 100)]
    public decimal GstPercent { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal MRP { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal DefaultSalePrice { get; set; }
    
    public int? CategoryId { get; set; }
}

public class UpdateProductDto
{
    [Required]
    [MaxLength(50)]
    public string SKU { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; }
    
    [MaxLength(20)]
    public string HSN { get; set; }
    
    [Range(0, 100)]
    public decimal GstPercent { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal MRP { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal DefaultSalePrice { get; set; }
    
    public int? CategoryId { get; set; }
}
