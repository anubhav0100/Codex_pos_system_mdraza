namespace PointOnSale.Application.DTOs.CompanyAdmins;

public class CompanyAdminDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CompanyId { get; set; }
}
