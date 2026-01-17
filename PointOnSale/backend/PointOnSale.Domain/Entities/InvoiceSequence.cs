namespace PointOnSale.Domain.Entities;

public class InvoiceSequence
{
    public int Id { get; set; }
    
    public int CompanyId { get; set; }
    public Company Company { get; set; }
    
    public string FiscalYear { get; set; } // e.g. "24-25"
    
    public int CurrentSequence { get; set; } // e.g. 101, increments
}
