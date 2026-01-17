using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class InventoryRepository(PosDbContext dbContext) : IInventoryRepository
{
    public async Task AddLedgerEntryAsync(InventoryLedger ledger, CancellationToken cancellationToken = default)
    {
        dbContext.InventoryLedgers.Add(ledger);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<InventoryLedger>> GetLedgerAsync(int scopeNodeId, int? productId = null, CancellationToken cancellationToken = default)
    {
        var query = dbContext.InventoryLedgers
            .AsNoTracking()
            .Include(l => l.Product)
            .Where(l => l.ScopeNodeId == scopeNodeId);

        if (productId.HasValue)
        {
            query = query.Where(l => l.ProductId == productId.Value);
        }

        return await query.OrderByDescending(l => l.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<StockBalance?> GetBalanceAsync(int scopeNodeId, int productId, CancellationToken cancellationToken = default)
    {
        return await dbContext.StockBalances
            .Include(b => b.Product)
            .FirstOrDefaultAsync(b => b.ScopeNodeId == scopeNodeId && b.ProductId == productId, cancellationToken);
    }

    public async Task<List<StockBalance>> GetBalancesByScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.StockBalances
            .AsNoTracking()
            .Include(b => b.Product)
            .Where(b => b.ScopeNodeId == scopeNodeId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddBalanceAsync(StockBalance balance, CancellationToken cancellationToken = default)
    {
        dbContext.StockBalances.Add(balance);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateBalanceAsync(StockBalance balance, CancellationToken cancellationToken = default)
    {
        dbContext.StockBalances.Update(balance);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
