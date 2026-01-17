namespace PointOnSale.Domain.Entities;

public class SubscriptionPlan
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal MonthlyPrice { get; set; }
    public string LimitsJson { get; set; } // JSON string for limits
    public bool IsActive { get; set; }
}
