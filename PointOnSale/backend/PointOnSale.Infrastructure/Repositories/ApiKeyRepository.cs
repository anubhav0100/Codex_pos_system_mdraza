using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class ApiKeyRepository(PosDbContext dbContext) : IApiKeyRepository
{
    public async Task<ApiKey?> GetByHashAsync(string keyHash, CancellationToken cancellationToken = default)
    {
        return await dbContext.ApiKeys
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.KeyHash == keyHash, cancellationToken);
    }

    public async Task<ApiKey> AddAsync(ApiKey apiKey, CancellationToken cancellationToken = default)
    {
        dbContext.ApiKeys.Add(apiKey);
        await dbContext.SaveChangesAsync(cancellationToken);
        return apiKey;
    }

    public async Task<List<ApiKey>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.ApiKeys
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApiKey?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ApiKeys.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task UpdateAsync(ApiKey apiKey, CancellationToken cancellationToken = default)
    {
        dbContext.ApiKeys.Update(apiKey);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
