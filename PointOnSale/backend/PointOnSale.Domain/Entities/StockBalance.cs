namespace PointOnSale.Domain.Entities;

public class StockBalance
{
    public int ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public int QtyOnHand { get; set; }
}
