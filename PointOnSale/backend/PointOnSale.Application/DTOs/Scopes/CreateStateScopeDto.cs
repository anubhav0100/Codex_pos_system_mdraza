using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Scopes;

public class CreateStateScopeDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    [MaxLength(20)]
    public string Code { get; set; } // Could be state code e.g. "NY"

    [Required]
    public int ParentScopeId { get; set; } // Should be Company Root
}
