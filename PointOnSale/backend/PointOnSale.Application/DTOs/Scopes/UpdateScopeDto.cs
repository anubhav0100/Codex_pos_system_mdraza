using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Scopes;

public class UpdateScopeDto
{
    [Required]
    [MaxLength(120)]
    public string? Name { get; set; }
}
