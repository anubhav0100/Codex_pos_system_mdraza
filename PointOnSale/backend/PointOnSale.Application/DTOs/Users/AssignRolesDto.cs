using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Users;

public class AssignRolesDto
{
    [Required]
    public List<int> RoleIds { get; set; } = new();
}
