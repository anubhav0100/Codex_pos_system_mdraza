using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class RoleRepository(PosDbContext dbContext) : IRoleRepository
{
    public async Task<Role?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await dbContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Code == code, cancellationToken);
    }

    public async Task<List<Role>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default)
    {
        return await dbContext.Roles
            .AsNoTracking()
            .Where(r => ids.Contains(r.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Role>> GetAllAsync(ScopeType? scopeType = null, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Roles.AsNoTracking();
        if (scopeType.HasValue)
        {
            query = query.Where(role => role.ScopeType == scopeType.Value);
        }
        return await query.ToListAsync(cancellationToken);
    }
}
