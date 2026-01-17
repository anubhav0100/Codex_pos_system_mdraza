using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IScopeRepository
{
    Task<List<ScopeNode>> GetAllByCompanyIdAsync(int companyId, CancellationToken cancellationToken = default);
    Task<ScopeNode?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ScopeNode> AddAsync(ScopeNode scopeNode, CancellationToken cancellationToken = default);
    Task<ScopeNode> AddStateScopeAsync(ScopeNode scope, LocationState state, CancellationToken cancellationToken = default);
    Task<ScopeNode> AddDistrictScopeAsync(ScopeNode scope, LocationDistrict district, CancellationToken cancellationToken = default);
    Task<ScopeNode> AddLocalScopeAsync(ScopeNode scope, LocationLocal local, CancellationToken cancellationToken = default);
    Task UpdateAsync(ScopeNode scope, CancellationToken cancellationToken = default);
}
