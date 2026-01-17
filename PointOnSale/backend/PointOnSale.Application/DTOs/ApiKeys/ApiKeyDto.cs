namespace PointOnSale.Application.DTOs.ApiKeys;

public class ApiKeyDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Key { get; set; } // Only returned on creation
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
