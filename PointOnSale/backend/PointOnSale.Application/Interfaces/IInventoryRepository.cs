using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IInventoryRepository
{
    // Ledger
    Task AddLedgerEntryAsync(InventoryLedger ledger, CancellationToken cancellationToken = default);
    Task<List<InventoryLedger>> GetLedgerAsync(int scopeNodeId, int? productId = null, CancellationToken cancellationToken = default);

    // Balance
    Task<StockBalance?> GetBalanceAsync(int scopeNodeId, int productId, CancellationToken cancellationToken = default);
    Task<List<StockBalance>> GetBalancesByScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default);
    Task AddBalanceAsync(StockBalance balance, CancellationToken cancellationToken = default);
    Task UpdateBalanceAsync(StockBalance balance, CancellationToken cancellationToken = default);
}
