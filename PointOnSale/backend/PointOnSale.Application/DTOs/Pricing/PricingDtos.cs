namespace PointOnSale.Application.DTOs.Pricing;

public class TaxLineDto
{
    public string TaxName { get; set; }
    public decimal Percent { get; set; }
    public decimal Amount { get; set; }
}

public class InvoiceTotalDto
{
    public decimal SubTotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public List<TaxLineDto> TaxLines { get; set; } = new();
}

public class InvoiceLineDto
{
    public int ProductId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Qty { get; set; }
    public decimal Discount { get; set; } // Per line discount
    public decimal TaxPercent { get; set; }
}
