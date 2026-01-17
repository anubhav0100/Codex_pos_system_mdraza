using System;
using System.Collections.Generic;

namespace PointOnSale.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string SKU { get; set; } // Unique
    public string Name { get; set; }
    public string HSN { get; set; }
    public decimal GstPercent { get; set; }
    public decimal MRP { get; set; }
    public decimal DefaultSalePrice { get; set; }
    public bool IsActive { get; set; }
    
    public int? CategoryId { get; set; }
    public ProductCategory Category { get; set; }
    
    // Using simple approach, referencing ScopeNode via Assignments
    public ICollection<ProductAssignment> Assignments { get; set; }
}
