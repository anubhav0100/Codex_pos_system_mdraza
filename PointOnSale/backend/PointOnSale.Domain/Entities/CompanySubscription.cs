using System;

namespace PointOnSale.Domain.Entities;

public class CompanySubscription
{
    public int CompanyId { get; set; }
    public Company Company { get; set; }
    
    public int PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}
