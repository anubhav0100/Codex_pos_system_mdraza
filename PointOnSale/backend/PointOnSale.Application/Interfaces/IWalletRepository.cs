using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.Interfaces;

public interface IWalletRepository
{
    Task<WalletAccount?> GetByScopeAndTypeAsync(int scopeNodeId, WalletType type, CancellationToken cancellationToken = default);
    Task<List<WalletAccount>> GetByScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default);
    Task<List<WalletLedger>> GetLedgerAsync(int walletId, CancellationToken cancellationToken = default);
    Task AddWalletAsync(WalletAccount wallet, CancellationToken cancellationToken = default);
    Task UpdateWalletAsync(WalletAccount wallet, CancellationToken cancellationToken = default);
    Task AddLedgerEntryAsync(WalletLedger ledger, CancellationToken cancellationToken = default);
}
