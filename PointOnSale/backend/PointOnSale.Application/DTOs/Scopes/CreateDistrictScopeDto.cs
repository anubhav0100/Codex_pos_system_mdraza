using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Scopes;

public class CreateDistrictScopeDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    public int ParentScopeId { get; set; } // Should be State Scope
}
