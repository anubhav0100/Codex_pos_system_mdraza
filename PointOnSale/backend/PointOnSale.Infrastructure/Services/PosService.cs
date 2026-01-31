using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.DTOs.Pos;
using PointOnSale.Application.DTOs.Pricing;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class PosService(
    PosDbContext dbContext,
    IPricingService pricingService,
    IInventoryService inventoryService,
    IScopeRepository scopeRepository,
    IWalletService walletService
    ) : IPosService
{
    public async Task<SalesOrderDto> CreateSaleAsync(CreateSaleDto dto, CancellationToken cancellationToken = default)
    {
        // 1. Validate Scope (Must be Local)
        var scope = await scopeRepository.GetByIdAsync(dto.ScopeNodeId);
        if (scope == null) throw new KeyNotFoundException("Scope not found");
        if (scope.ScopeType != ScopeType.Local) throw new InvalidOperationException("Sales can only be created at Local scope");

        // 2. Prepare Items & Calculate Totals
        var salesOrderItems = new List<SalesOrderItem>();
        var invoiceLines = new List<InvoiceLineDto>();

        foreach (var itemDto in dto.Items)
        {
            // Validate Product Assignment (Is Allowed?)
            var assignment = await dbContext.ProductAssignments
                .AsNoTracking()
                .FirstOrDefaultAsync(pa => pa.ScopeNodeId == dto.ScopeNodeId && pa.ProductId == itemDto.ProductId, cancellationToken);

            if (assignment == null) 
                 throw new InvalidOperationException($"Product {itemDto.ProductId} is not assigned to this scope");
             
            if (!assignment.IsAllowed)
                 throw new InvalidOperationException($"Product {itemDto.ProductId} is not allowed for sale in this scope");

            // Get Price
            var unitPrice = await pricingService.GetEffectiveUnitPriceAsync(dto.ScopeNodeId, itemDto.ProductId, cancellationToken);
            
            // Get Product Details (for Tax)
            var product = await dbContext.Products.FindAsync(new object[] { itemDto.ProductId }, cancellationToken);
            if (product == null) throw new KeyNotFoundException($"Product {itemDto.ProductId} not found");

            // Calculate Grid Line Logic
            // Note: Tax calculation happens in PricingService on Aggregate, but we need per-line data here too.
            // Let's rely on PricingService Totals for the Order Level, but store line details.
            
            decimal lineTotal = unitPrice * itemDto.Qty;
            
            salesOrderItems.Add(new SalesOrderItem
            {
                ProductId = itemDto.ProductId,
                Qty = itemDto.Qty,
                UnitPrice = unitPrice,
                TaxPercent = product.GstPercent,
                LineTotal = lineTotal
                // Product navigation prop will be set by EF
            });

            invoiceLines.Add(new InvoiceLineDto
            {
                ProductId = itemDto.ProductId,
                Qty = itemDto.Qty,
                UnitPrice = unitPrice,
                TaxPercent = product.GstPercent,
                Discount = 0 // Future: Discount logic
            });
        }

        // 3. Calculate Ledger Totals
        var totals = pricingService.CalculateInvoiceTotals(invoiceLines);

        // 4. Create SalesOrder
        var salesOrder = new SalesOrder
        {
            ScopeNodeId = dto.ScopeNodeId,
            Status = SalesStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Total = totals.SubTotal,
            TaxTotal = totals.TaxTotal,
            GrandTotal = totals.GrandTotal,
            PaymentMethod = PaymentMethod.Cash, // Default, updated on confirm
            PaymentRef = "",
            Items = salesOrderItems
        };

        dbContext.SalesOrders.Add(salesOrder);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(salesOrder);
    }

    public async Task<SalesOrderDto> ConfirmPaymentAsync(int salesOrderId, ConfirmPaymentDto dto, CancellationToken cancellationToken = default)
    {
        var order = await dbContext.SalesOrders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == salesOrderId, cancellationToken);
            
        if (order == null) throw new KeyNotFoundException("Order not found");
        
        if (order.Status != SalesStatus.Pending)
            throw new InvalidOperationException($"Order is in {order.Status} state, cannot confirm payment");

        // Transactional: Inventory Deduction + Order Update
        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // 1. Deduct Inventory
            foreach (var item in order.Items)
            {
                await inventoryService.AddStockMovementAsync(
                    order.ScopeNodeId,
                    item.ProductId,
                    -item.Qty,
                    StockTxnType.Sale,
                    "SalesOrder",
                    order.Id.ToString(),
                    allowNegative: false, // Enforce stock availability!
                    cancellationToken
                );
            }

            // 3. Credit Income Wallet
            var incomeWallet = await walletService.GetWalletAsync(order.ScopeNodeId, WalletType.Income, cancellationToken);
            
            // For POS Sales, there is no internal "From" wallet (it's external money).
            // Passing null as fromWalletId credits the target wallet.
            await walletService.ProcessTransferAsync(
                null, 
                incomeWallet.Id, 
                order.GrandTotal, 
                "POSSale", 
                order.Id.ToString(), 
                $"POS Sale Confirmation: {dto.PaymentMethod}", 
                cancellationToken: cancellationToken
            );
            
            // 2. Update Order
            order.Status = SalesStatus.Completed;
            order.PaymentMethod = dto.PaymentMethod;
            order.PaymentRef = dto.PaymentRef ?? "";
            
            // 3. Create Invoice (Optional - reusing logic used for calculation)
            // For now, simpler to just persist Order state. Invoice entity creation can be added if specific invoice numbering/compliance required.
            
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            
            return ToDto(order);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<SalesOrderDto?> GetSaleAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await dbContext.SalesOrders
             .AsNoTracking()
             .Include(o => o.Items).ThenInclude(i => i.Product)
             .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        return order == null ? null : ToDto(order);
    }

    public async Task<List<SalesOrderDto>> GetSalesAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default)
    {
        var query = dbContext.SalesOrders
             .AsNoTracking()
             .Include(o => o.Items).ThenInclude(i => i.Product)
             .Where(o => o.ScopeNodeId == scopeNodeId);

        if (dateFrom.HasValue) query = query.Where(o => o.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(o => o.CreatedAt <= dateTo.Value);

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync(cancellationToken);
        return orders.Select(ToDto).ToList();
    }

    private static SalesOrderDto ToDto(SalesOrder order)
    {
        return new SalesOrderDto
        {
            Id = order.Id,
            Status = order.Status.ToString(),
            ScopeNodeId = order.ScopeNodeId,
            Total = order.Total,
            TaxTotal = order.TaxTotal,
            GrandTotal = order.GrandTotal,
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentRef = order.PaymentRef,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new SalesOrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "Unknown",
                Qty = i.Qty,
                UnitPrice = i.UnitPrice,
                TaxPercent = i.TaxPercent,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}
