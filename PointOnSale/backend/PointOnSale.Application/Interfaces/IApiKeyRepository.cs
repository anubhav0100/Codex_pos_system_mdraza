using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IApiKeyRepository
{
    Task<ApiKey?> GetByHashAsync(string keyHash, CancellationToken cancellationToken = default);
    Task<ApiKey> AddAsync(ApiKey apiKey, CancellationToken cancellationToken = default);
    Task<List<ApiKey>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiKey?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApiKey apiKey, CancellationToken cancellationToken = default);
}
