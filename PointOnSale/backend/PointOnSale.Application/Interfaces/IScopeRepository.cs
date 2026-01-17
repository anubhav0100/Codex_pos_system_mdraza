using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IScopeRepository
{
    Task<List<ScopeNode>> GetAllByCompanyIdAsync(int companyId, CancellationToken cancellationToken = default);
    Task<ScopeNode?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
