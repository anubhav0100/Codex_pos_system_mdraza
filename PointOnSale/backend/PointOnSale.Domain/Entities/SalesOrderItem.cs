namespace PointOnSale.Domain.Entities;

public class SalesOrderItem
{
    public int SalesOrderId { get; set; }
    public SalesOrder SalesOrder { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public int Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal LineTotal { get; set; }
}
