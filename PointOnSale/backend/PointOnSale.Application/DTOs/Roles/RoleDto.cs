namespace PointOnSale.Application.DTOs.Roles;

public class RoleDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ScopeType { get; set; }
}
