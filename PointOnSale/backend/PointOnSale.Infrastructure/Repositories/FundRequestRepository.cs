using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class FundRequestRepository(PosDbContext dbContext) : IFundRequestRepository
{
    public async Task<FundRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.FundRequests
            .Include(r => r.FromScopeNode)
            .Include(r => r.ToScopeNode)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<FundRequest>> GetByScopeAsync(int scopeNodeId, bool isIncoming, CancellationToken cancellationToken = default)
    {
        var query = dbContext.FundRequests
            .Include(r => r.FromScopeNode).ThenInclude(s => s.Company)
            .Include(r => r.FromScopeNode).ThenInclude(s => s.State)
            .Include(r => r.FromScopeNode).ThenInclude(s => s.District)
            .Include(r => r.FromScopeNode).ThenInclude(s => s.Local)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.Company)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.State)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.District)
            .Include(r => r.ToScopeNode).ThenInclude(s => s.Local)
            .AsNoTracking();

        if (isIncoming)
        {
            query = query.Where(r => r.ToScopeNodeId == scopeNodeId);
        }
        else
        {
            query = query.Where(r => r.FromScopeNodeId == scopeNodeId);
        }

        return await query
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(FundRequest request, CancellationToken cancellationToken = default)
    {
        dbContext.FundRequests.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(FundRequest request, CancellationToken cancellationToken = default)
    {
        dbContext.FundRequests.Update(request);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
