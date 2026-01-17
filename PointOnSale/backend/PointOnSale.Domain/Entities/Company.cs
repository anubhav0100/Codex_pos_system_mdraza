using System;

namespace PointOnSale.Domain.Entities;

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; } // Added for Invoice Numbering
    public string Gstin { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
}
