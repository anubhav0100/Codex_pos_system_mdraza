using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Products;

public class ProductAssignmentDto
{
    public int ScopeNodeId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string ProductSKU { get; set; }
    public decimal ProductMRP { get; set; }
    public decimal ProductDefaultSalePrice { get; set; }
    
    // Assignment specific
    public bool IsAllowed { get; set; }
    public decimal? PriceOverride { get; set; }
    
    // Computed Effective Price
    public decimal EffectivePrice { get; set; }
}

public class AssignProductDto
{
    [Required]
    public int ScopeNodeId { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
    public bool IsAllowed { get; set; } = true;
    
    [Range(0, double.MaxValue)]
    public decimal? PriceOverride { get; set; }
}

public class UpdateProductAssignmentDto
{
    public bool IsAllowed { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? PriceOverride { get; set; }
}

public class BulkAssignProductDto
{
    [Required]
    public int ScopeNodeId { get; set; }
    
    [Required]
    public List<int> ProductIds { get; set; } = new();
    
    public bool IsAllowed { get; set; } = true;
    
    [Range(0, double.MaxValue)]
    public decimal? PriceOverride { get; set; }
}
