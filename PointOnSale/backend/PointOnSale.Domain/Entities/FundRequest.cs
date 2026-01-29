using System;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class FundRequest
{
    public int Id { get; set; }
    
    public int FromScopeNodeId { get; set; }
    public ScopeNode FromScopeNode { get; set; }
    
    public int ToScopeNodeId { get; set; } // Usually the parent company or upper node
    public ScopeNode ToScopeNode { get; set; }
    
    public decimal Amount { get; set; }
    public string Status { get; set; } // PENDING, APPROVED, REJECTED
    
    public string Notes { get; set; }
    public string RejectionReason { get; set; }
    
    public DateTime RequestedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public int? ProcessedByUserId { get; set; } // Optional: ID of user who approved/rejected
}
