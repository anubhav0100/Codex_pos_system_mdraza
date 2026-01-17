using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Users;

public class CreateUserDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    public int ScopeNodeId { get; set; }

    public List<int> RoleIds { get; set; } = new();
}
