using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
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
}
