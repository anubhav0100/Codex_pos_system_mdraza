namespace PointOnSale.Application.DTOs.Subscriptions;

public class SubscriptionPlanDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal MonthlyPrice { get; set; }
    public string LimitsJson { get; set; }
    public bool IsActive { get; set; }
}
