using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.Interfaces;

public interface IWalletService
{
    Task EnsureWalletsForScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default);
    Task ProcessTransferAsync(int fromWalletId, int toWalletId, decimal amount, string refType, string refId, string notes = null, CancellationToken cancellationToken = default);
    Task<WalletAccount> GetWalletAsync(int scopeNodeId, WalletType type, CancellationToken cancellationToken = default);
}
