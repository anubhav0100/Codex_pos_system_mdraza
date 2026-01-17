namespace PointOnSale.Domain.Entities;

public class ProductAssignment
{
    public int ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public bool IsAllowed { get; set; }
    public decimal? PriceOverride { get; set; }
}
