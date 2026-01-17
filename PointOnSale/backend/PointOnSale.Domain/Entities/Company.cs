using System;

namespace PointOnSale.Domain.Entities;

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Gstin { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
