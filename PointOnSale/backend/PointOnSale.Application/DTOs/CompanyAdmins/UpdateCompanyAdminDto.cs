using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.CompanyAdmins;

public class UpdateCompanyAdminDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; }
}
