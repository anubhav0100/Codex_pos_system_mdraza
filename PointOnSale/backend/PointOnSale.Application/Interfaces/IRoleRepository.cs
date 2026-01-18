using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Role>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default);
    Task<List<Role>> GetAllAsync(ScopeType? scopeType = null, CancellationToken cancellationToken = default);
}
