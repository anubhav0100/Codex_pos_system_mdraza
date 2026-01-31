using System;
using System.Collections.Generic;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class StockRequest
{
    public int Id { get; set; }
    
    public int FromScopeNodeId { get; set; }
    public ScopeNode FromScopeNode { get; set; }
    
    public int ToScopeNodeId { get; set; }
    public ScopeNode ToScopeNode { get; set; }
    
    public RequestStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? FulfilledAt { get; set; }
    
    public ICollection<StockRequestItem> Items { get; set; }
    
    public int? CreatedByUserId { get; set; }
    public AppUser CreatedByUser { get; set; }
}
