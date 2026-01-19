namespace PointOnSale.Application.DTOs.Companies;

public class CompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public string Gstin { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
