using System;

namespace PointOnSale.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public AppUser User { get; set; }
    
    public string Action { get; set; }
    public string Entity { get; set; }
    public string EntityId { get; set; } // Could be int, assuming string for flexibility
    
    public string BeforeJson { get; set; }
    public string AfterJson { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public string Ip { get; set; }
}
