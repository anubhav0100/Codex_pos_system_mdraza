using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.Interfaces;

public interface IInventoryService
{
    Task AddStockMovementAsync(
        int scopeNodeId, 
        int productId, 
        int qtyChange, 
        StockTxnType txnType, 
        string refType, 
        string refId, 
        bool allowNegative = false,
        CancellationToken cancellationToken = default);
}
