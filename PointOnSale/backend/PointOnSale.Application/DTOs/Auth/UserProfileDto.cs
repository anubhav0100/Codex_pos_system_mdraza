using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.DTOs.Auth;

public class UserProfileDto
{
    public int UserId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    
    public int? ScopeNodeId { get; set; }
    public ScopeType? ScopeType { get; set; }
    public int CompanyId { get; set; } // Derived from ScopeNode
    
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}
