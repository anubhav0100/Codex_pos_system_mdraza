using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
}
