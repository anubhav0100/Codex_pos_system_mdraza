using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Subscriptions;

public class CreateSubscriptionPlanDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MonthlyPrice { get; set; }

    public string LimitsJson { get; set; } = "{}";
}
