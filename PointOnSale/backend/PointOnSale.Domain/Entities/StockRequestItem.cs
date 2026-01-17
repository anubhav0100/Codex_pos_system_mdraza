namespace PointOnSale.Domain.Entities;

public class StockRequestItem
{
    public int StockRequestId { get; set; }
    public StockRequest StockRequest { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public int Qty { get; set; }
}
