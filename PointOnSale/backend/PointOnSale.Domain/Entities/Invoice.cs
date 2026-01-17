using System;
using System.Collections.Generic;

namespace PointOnSale.Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    
    public int CompanyId { get; set; }
    public Company Company { get; set; }
    
    public int ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }
    
    public string InvoiceNo { get; set; }
    public DateTime InvoiceDate { get; set; }
    
    public string CustomerName { get; set; }
    public string CustomerPhone { get; set; }
    public string Gstin { get; set; } // Nullable
    
    public decimal Subtotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal Total { get; set; }
    
    public ICollection<InvoiceLine> InvoiceLines { get; set; }
}
