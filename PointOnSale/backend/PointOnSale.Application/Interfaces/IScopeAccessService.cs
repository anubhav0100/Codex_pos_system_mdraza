using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.Interfaces;

public interface IScopeAccessService
{
    Task<bool> CanAccessScopeAsync(int userScopeNodeId, int targetScopeNodeId, CancellationToken cancellationToken = default);
    Task<List<int>> GetAccessibleScopeNodeIdsAsync(int userScopeNodeId, CancellationToken cancellationToken = default);
    Task EnsureTargetInSubtreeAsync(int userScopeNodeId, int targetScopeNodeId, CancellationToken cancellationToken = default);
}
