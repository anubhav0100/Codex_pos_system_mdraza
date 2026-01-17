using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface ISubscriptionRepository
{
    Task<List<SubscriptionPlan>> GetAllPlansAsync(CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetPlanByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan> AddPlanAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);
    Task UpdatePlanAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);
    Task DeletePlanAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);

    Task<CompanySubscription?> GetActiveSubscriptionAsync(int companyId, CancellationToken cancellationToken = default);
    Task AddCompanySubscriptionAsync(CompanySubscription subscription, CancellationToken cancellationToken = default);
}
