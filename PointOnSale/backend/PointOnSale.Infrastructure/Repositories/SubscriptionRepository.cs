using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class SubscriptionRepository(PosDbContext dbContext) : ISubscriptionRepository
{
    public async Task<List<SubscriptionPlan>> GetAllPlansAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.SubscriptionPlans.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetPlanByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<SubscriptionPlan> AddPlanAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default)
    {
        dbContext.SubscriptionPlans.Add(plan);
        await dbContext.SaveChangesAsync(cancellationToken);
        return plan;
    }

    public async Task UpdatePlanAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default)
    {
        dbContext.SubscriptionPlans.Update(plan);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeletePlanAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default)
    {
        // Hard delete or soft? Entity has IsActive. I'll just remove or set active false?
        // User asked for CRUD. Usually plans are soft deleted if used. 
        // Logic: specific implementation can be decided. I will create a method but if entity doesn't support soft delete explicitly (IsDeleted) I might just remove.
        // SubscriptionPlan has IsActive.
        dbContext.SubscriptionPlans.Remove(plan); 
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<CompanySubscription?> GetActiveSubscriptionAsync(int companyId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await dbContext.CompanySubscriptions
            .AsNoTracking()
            .Include(x => x.Plan)
            .OrderByDescending(x => x.EndDate) 
            .FirstOrDefaultAsync(x => x.CompanyId == companyId && x.IsActive && x.EndDate > now && x.StartDate <= now, cancellationToken);
    }

    public async Task AddCompanySubscriptionAsync(CompanySubscription subscription, CancellationToken cancellationToken = default)
    {
        // Deactivate old active subscriptions? 
        // Simple logic: just add new one.
        dbContext.CompanySubscriptions.Add(subscription);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
