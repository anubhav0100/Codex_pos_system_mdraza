using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Constants;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Application.Services;

public class ScopeAccessService(IScopeRepository scopeRepository) : IScopeAccessService
{
    public async Task<bool> CanAccessScopeAsync(int userScopeNodeId, int targetScopeNodeId, CancellationToken cancellationToken = default)
    {
        var accessibleIds = await GetAccessibleScopeNodeIdsAsync(userScopeNodeId, cancellationToken);
        return accessibleIds.Contains(targetScopeNodeId);
    }

    public async Task EnsureTargetInSubtreeAsync(int userScopeNodeId, int targetScopeNodeId, CancellationToken cancellationToken = default)
    {
        if (!await CanAccessScopeAsync(userScopeNodeId, targetScopeNodeId, cancellationToken))
        {
            var error = new ErrorDetail(ErrorCodes.AUTH_FORBIDDEN, "You do not have access to this scope.");
            throw new Exception("Forbidden: Scope Access Denied"); // Should be handled by global exception middleware or custom exception
        }
    }

    public async Task<List<int>> GetAccessibleScopeNodeIdsAsync(int userScopeNodeId, CancellationToken cancellationToken = default)
    {
        var userScope = await scopeRepository.GetByIdAsync(userScopeNodeId, cancellationToken);
        if (userScope == null) return new List<int>();

        // Fetch all nodes for the company to build tree in memory
        // Optimization: For large trees, use CTE or hierarchyid. For now, in-memory is fine.
        var allNodes = await scopeRepository.GetAllByCompanyIdAsync(userScope.CompanyId, cancellationToken);

        var accessibleIds = new List<int>();
        var queue = new Queue<int>();
        
        queue.Enqueue(userScopeNodeId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            accessibleIds.Add(currentId);

            var children = allNodes.Where(n => n.ParentScopeNodeId == currentId).Select(n => n.Id);
            foreach (var childId in children)
            {
                queue.Enqueue(childId);
            }
        }

        return accessibleIds;
    }
}
