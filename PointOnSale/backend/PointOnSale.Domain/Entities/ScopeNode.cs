using System;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class ScopeNode
{
    public int Id { get; set; }
    public ScopeType ScopeType { get; set; }
    
    public int CompanyId { get; set; }
    public int? StateId { get; set; }
    public int? DistrictId { get; set; }
    public int? LocalId { get; set; }
    
    public int? ParentScopeNodeId { get; set; }
    public bool IsActive { get; set; }

    // Navigation properties
    public Company Company { get; set; }
    public ScopeNode ParentScopeNode { get; set; }
    public LocationState State { get; set; }
    public LocationDistrict District { get; set; }
    public LocationLocal Local { get; set; }
}
