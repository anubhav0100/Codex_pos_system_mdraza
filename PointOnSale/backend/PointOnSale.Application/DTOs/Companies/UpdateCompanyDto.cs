using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Companies;

public class UpdateCompanyDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(20)]
    public string? Gstin { get; set; }
}
