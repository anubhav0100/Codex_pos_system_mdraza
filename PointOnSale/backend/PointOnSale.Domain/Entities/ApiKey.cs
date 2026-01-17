using System;

namespace PointOnSale.Domain.Entities;

public class ApiKey
{
    public int Id { get; set; }
    public int? CompanyId { get; set; }
    public string Name { get; set; }
    public string KeyHash { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public Company Company { get; set; }
}
