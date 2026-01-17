using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class WalletService(
    IWalletRepository walletRepository,
    PosDbContext dbContext // For transaction
    ) : IWalletService
{
    public async Task EnsureWalletsForScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default)
    {
        // Check and create Fund, Income, SalesIncentive if they don't exist
        var types = new[] { WalletType.Fund, WalletType.Income, WalletType.SalesIncentive };
        
        foreach (var type in types)
        {
            var existing = await walletRepository.GetByScopeAndTypeAsync(scopeNodeId, type, cancellationToken);
            if (existing == null)
            {
                var wallet = new WalletAccount
                {
                    ScopeNodeId = scopeNodeId,
                    WalletType = type,
                    Balance = 0 // Start with 0
                };
                await walletRepository.AddWalletAsync(wallet, cancellationToken);
            }
        }
    }

    public async Task<WalletAccount> GetWalletAsync(int scopeNodeId, WalletType type, CancellationToken cancellationToken = default)
    {
        var wallet = await walletRepository.GetByScopeAndTypeAsync(scopeNodeId, type, cancellationToken);
        if (wallet == null)
        {
            await EnsureWalletsForScopeAsync(scopeNodeId, cancellationToken);
            wallet = await walletRepository.GetByScopeAndTypeAsync(scopeNodeId, type, cancellationToken);
        }
        return wallet!;
    }

    public async Task ProcessTransferAsync(int fromWalletId, int toWalletId, decimal amount, string refType, string refId, string notes = null, CancellationToken cancellationToken = default)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // 1. Ledger Entry (Ledger First)
            var ledger = new WalletLedger
            {
                FromWalletId = fromWalletId,
                ToWalletId = toWalletId,
                Amount = amount,
                RefType = refType,
                RefId = refId,
                CreatedAt = DateTime.UtcNow,
                Notes = notes
            };
            await walletRepository.AddLedgerEntryAsync(ledger, cancellationToken);

            // 2. Update Balances
            // We need to fetch entities tracked to update them
            var fromWallet = await dbContext.WalletAccounts.FindAsync(new object[] { fromWalletId }, cancellationToken);
            var toWallet = await dbContext.WalletAccounts.FindAsync(new object[] { toWalletId }, cancellationToken);

            if (fromWallet == null || toWallet == null)
                throw new InvalidOperationException("One or both wallets not found");

            if (fromWallet.Balance < amount)
                throw new InvalidOperationException($"Insufficient balance in {fromWallet.WalletType} wallet. Available: {fromWallet.Balance}, Required: {amount}");

            fromWallet.Balance -= amount;
            toWallet.Balance += amount;

            await dbContext.SaveChangesAsync(cancellationToken); // Save balance updates

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
