namespace PointOnSale.Domain.Entities;

public class InvoiceLine
{
    public int InvoiceId { get; set; }
    public Invoice Invoice { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public int Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxPercent { get; set; }
    public string HSN { get; set; }
    public decimal LineTotal { get; set; }
}
