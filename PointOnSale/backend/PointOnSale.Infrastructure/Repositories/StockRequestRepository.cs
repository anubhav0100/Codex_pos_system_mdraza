using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class StockRequestRepository(PosDbContext dbContext) : IStockRequestRepository
{
    public async Task<StockRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.StockRequests
            .Include(r => r.FromScopeNode)
            .Include(r => r.ToScopeNode)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<StockRequest>> GetByScopeAsync(int scopeNodeId, bool isOutgoing, CancellationToken cancellationToken = default)
    {
        var query = dbContext.StockRequests
            .AsNoTracking()
            .AsNoTracking()
            .Include(r => r.FromScopeNode).ThenInclude(s => s.Company)
            .Include(r => r.FromScopeNode).ThenInclude(s => s.State)
            .Include(r => r.FromScopeNode).ThenInclude(s => s.District)
            .Include(r => r.FromScopeNode).ThenInclude(s => s.Local)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.Company)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.State)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.District)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.Local)
            .AsQueryable();

        if (isOutgoing)
        {
            query = query.Where(r => r.FromScopeNodeId == scopeNodeId);
        }
        else
        {
            query = query.Where(r => r.ToScopeNodeId == scopeNodeId);
        }

        return await query.OrderByDescending(r => r.RequestedAt).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(StockRequest request, CancellationToken cancellationToken = default)
    {
        dbContext.StockRequests.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(StockRequest request, CancellationToken cancellationToken = default)
    {
        dbContext.StockRequests.Update(request);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
