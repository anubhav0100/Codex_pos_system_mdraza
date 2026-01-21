using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.DTOs.Scopes;

public class ScopeNodeDto
{
    public int Id { get; set; }
    public ScopeType ScopeType { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    
    public int? ParentId { get; set; }
    
    // Additional Details
    public int? StateId { get; set; }
    public int? DistrictId { get; set; }
    public int? LocalId { get; set; }

    public List<ScopeNodeDto> Children { get; set; } = new();
}
