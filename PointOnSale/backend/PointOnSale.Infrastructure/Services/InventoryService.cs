using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class InventoryService(
    IInventoryRepository inventoryRepository,
    PosDbContext dbContext // For Transaction
    ) : IInventoryService
{
    public async Task AddStockMovementAsync(
        int scopeNodeId, 
        int productId, 
        int qtyChange, 
        StockTxnType txnType, 
        string refType, 
        string refId, 
        bool allowNegative = false,
        CancellationToken cancellationToken = default)
    {
        // Using ExecutionStrategy for retries if needed, but simple transaction for atomic update of Ledger + Balance.
        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // 1. Update Balance
            var balance = await inventoryRepository.GetBalanceAsync(scopeNodeId, productId, cancellationToken);
            if (balance == null)
            {
                // Create new balance entry
                if (!allowNegative && qtyChange < 0)
                     throw new InvalidOperationException($"Insufficient stock (New Item). Available: 0, Requested: {Math.Abs(qtyChange)}");

                balance = new StockBalance
                {
                    ScopeNodeId = scopeNodeId,
                    ProductId = productId,
                    QtyOnHand = qtyChange
                };
                await inventoryRepository.AddBalanceAsync(balance, cancellationToken);
            }
            else
            {
                if (!allowNegative && (balance.QtyOnHand + qtyChange) < 0)
                     throw new InvalidOperationException($"Insufficient stock. Available: {balance.QtyOnHand}, Requested: {Math.Abs(qtyChange)}");

                balance.QtyOnHand += qtyChange;
                await inventoryRepository.UpdateBalanceAsync(balance, cancellationToken);
            }

            // 2. Add Ledger Entry
            var ledger = new InventoryLedger
            {
                ScopeNodeId = scopeNodeId,
                ProductId = productId,
                QtyChange = qtyChange,
                TxnType = txnType,
                RefType = refType,
                RefId = refId,
                CreatedAt = DateTime.UtcNow
            };
            await inventoryRepository.AddLedgerEntryAsync(ledger, cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
