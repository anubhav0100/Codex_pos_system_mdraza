using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.Interfaces;

public interface IStockRequestRepository
{
    Task<StockRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<StockRequest>> GetByScopeAsync(int scopeNodeId, bool isOutgoing, CancellationToken cancellationToken = default);
    Task AddAsync(StockRequest request, CancellationToken cancellationToken = default);
    Task UpdateAsync(StockRequest request, CancellationToken cancellationToken = default);
}
