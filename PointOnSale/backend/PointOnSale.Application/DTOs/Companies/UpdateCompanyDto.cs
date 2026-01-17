using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Companies;

public class UpdateCompanyDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    [MaxLength(20)]
    public string Gstin { get; set; }
}
