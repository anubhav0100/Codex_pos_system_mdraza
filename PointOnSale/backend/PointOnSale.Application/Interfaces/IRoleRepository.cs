using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Role>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default);
}
