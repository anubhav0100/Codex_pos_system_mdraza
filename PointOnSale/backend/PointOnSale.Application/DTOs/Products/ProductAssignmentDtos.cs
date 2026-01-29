using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Products;

public class ProductAssignmentDto
{
    public int ScopeNodeId { get; set; }
    
    // Map Id to ProductId for frontend convenience
    public int Id { get; set; }
    public int ProductId { get; set; }
    
    public string Name { get; set; }
    public string Sku { get; set; }
    public decimal ProductMRP { get; set; }
    public decimal DefaultSalePrice { get; set; }
    
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

public class BulkAssignmentItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? PriceOverride { get; set; }
}

public class BulkAssignProductDto
{
    [Required]
    public int ScopeNodeId { get; set; }
    
    [Required]
    public List<BulkAssignmentItemDto> Assignments { get; set; } = new();
    
    public bool IsAllowed { get; set; } = true;

    // Optional: Update existing assignments (requested feature)
    public bool UpdateExisting { get; set; } = false;
}
