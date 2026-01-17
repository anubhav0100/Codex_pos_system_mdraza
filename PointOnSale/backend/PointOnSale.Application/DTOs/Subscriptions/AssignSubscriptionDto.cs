using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Subscriptions;

public class AssignSubscriptionDto
{
    [Required]
    public int PlanId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }
}
