using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Users;

public class UpdateUserDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }
}
