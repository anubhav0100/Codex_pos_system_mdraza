using PointOnSale.Application.DTOs.Pricing;

namespace PointOnSale.Application.DTOs.Invoices;

public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; }
    public DateTime InvoiceDate { get; set; }
    
    public string CustomerName { get; set; }
    public string CustomerPhone { get; set; }
    public string Gstin { get; set; }
    
    public decimal Subtotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal Total { get; set; }
    
    public List<InvoiceLineDto> Items { get; set; } = new();
}

public class InvoicePrintDto
{
    public string HtmlContent { get; set; }
}
