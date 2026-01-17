using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class WalletRepository(PosDbContext dbContext) : IWalletRepository
{
    public async Task<WalletAccount?> GetByScopeAndTypeAsync(int scopeNodeId, WalletType type, CancellationToken cancellationToken = default)
    {
        return await dbContext.WalletAccounts
            .FirstOrDefaultAsync(w => w.ScopeNodeId == scopeNodeId && w.WalletType == type, cancellationToken);
    }

    public async Task<List<WalletAccount>> GetByScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.WalletAccounts
            .Where(w => w.ScopeNodeId == scopeNodeId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<WalletLedger>> GetLedgerAsync(int walletId, CancellationToken cancellationToken = default)
    {
        return await dbContext.WalletLedgers
            .AsNoTracking()
            .Where(l => l.FromWalletId == walletId || l.ToWalletId == walletId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddWalletAsync(WalletAccount wallet, CancellationToken cancellationToken = default)
    {
        dbContext.WalletAccounts.Add(wallet);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateWalletAsync(WalletAccount wallet, CancellationToken cancellationToken = default)
    {
        dbContext.WalletAccounts.Update(wallet);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddLedgerEntryAsync(WalletLedger ledger, CancellationToken cancellationToken = default)
    {
        dbContext.WalletLedgers.Add(ledger);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
