using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.CompanyAdmins;

public class CreateCompanyAdminDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; }

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; }
}
