using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class ScopeRepository(PosDbContext dbContext) : IScopeRepository
{
    public async Task<List<ScopeNode>> GetAllByCompanyIdAsync(int companyId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ScopeNodes
            .AsNoTracking()
            .Where(x => x.CompanyId == companyId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ScopeNode?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ScopeNodes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }
}
