using PointOnSale.Application.DTOs.Inventory;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class StockRequestService(
    IStockRequestRepository requestRepository,
    IScopeRepository scopeRepository,
    IInventoryService inventoryService,
    IWalletService walletService,
    IPricingService pricingService,
    PosDbContext dbContext // For context if needed, though inventory service handles its own transactions.
    ) : IStockRequestService
{
    private async Task ValidateHierarchy(int fromId, int toId)
    {
        var fromScope = await scopeRepository.GetByIdAsync(fromId);
        var toScope = await scopeRepository.GetByIdAsync(toId);
        
        if (fromScope == null || toScope == null)
            throw new ArgumentException("Invalid Scope IDs");

        // Hierarchy Rules:
        // District -> State
        // State -> Company
        // Local -> District/State/Company
        
        bool valid = false;
        
        if (fromScope.ScopeType == ScopeType.State && toScope.ScopeType == ScopeType.Company) valid = true;
        else if (fromScope.ScopeType == ScopeType.District && toScope.ScopeType == ScopeType.State) valid = true;
        else if (fromScope.ScopeType == ScopeType.Local && (toScope.ScopeType == ScopeType.District || toScope.ScopeType == ScopeType.State || toScope.ScopeType == ScopeType.Company)) valid = true;
        
        // Also ensure they are in same tree? e.g. District's Parent State matches ToState?
        // Assuming loose coupling for now as user didn't specify strict tree traversal, but logical hierarchy.
        // If strict tree needed: check ParentScopeNodeId.
        
        if (!valid)
            throw new InvalidOperationException($"Invalid request hierarchy: {fromScope.ScopeType} cannot request from {toScope.ScopeType}");
    }

    public async Task<int> CreateRequestAsync(CreateStockRequestDto dto, CancellationToken cancellationToken = default)
    {
        await ValidateHierarchy(dto.FromScopeNodeId, dto.ToScopeNodeId);

        var request = new StockRequest
        {
            FromScopeNodeId = dto.FromScopeNodeId,
            ToScopeNodeId = dto.ToScopeNodeId,
            Status = RequestStatus.Draft,
            RequestedAt = DateTime.UtcNow,
            Items = dto.Items.Select(i => new StockRequestItem
            {
                ProductId = i.ProductId,
                Qty = i.Qty
            }).ToList()
        };

        await requestRepository.AddAsync(request, cancellationToken);
        return request.Id;
    }

    public async Task SubmitRequestAsync(int requestId, CancellationToken cancellationToken = default)
    {
        var request = await requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null) throw new KeyNotFoundException("Request not found");
        
        if (request.Status != RequestStatus.Draft)
            throw new InvalidOperationException("Only Draft requests can be submitted");

        request.Status = RequestStatus.Submitted;
        await requestRepository.UpdateAsync(request, cancellationToken);
    }

    public async Task ApproveRequestAsync(int requestId, int approverScopeId, CancellationToken cancellationToken = default)
    {
        var request = await requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null) throw new KeyNotFoundException("Request not found");
        
        if (request.ToScopeNodeId != approverScopeId)
             throw new UnauthorizedAccessException("Only the target supplier can approve this request");

        if (request.Status != RequestStatus.Submitted)
            throw new InvalidOperationException("Only Submitted requests can be approved");

        request.Status = RequestStatus.Approved;
        request.ApprovedAt = DateTime.UtcNow;
        await requestRepository.UpdateAsync(request, cancellationToken);
    }

    public async Task RejectRequestAsync(int requestId, int rejectorScopeId, string reason, CancellationToken cancellationToken = default)
    {
        var request = await requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null) throw new KeyNotFoundException("Request not found");

        if (request.ToScopeNodeId != rejectorScopeId)
             throw new UnauthorizedAccessException("Only the target supplier can reject this request");
             
        if (request.Status != RequestStatus.Submitted)
            throw new InvalidOperationException("Can only reject Submitted requests");

        request.Status = RequestStatus.Rejected;
        // logic to store reason if entity supports it? StockRequest doesn't have Reason field. Ignoring for now or logging.
        await requestRepository.UpdateAsync(request, cancellationToken);
    }

    public async Task FulfillRequestAsync(int requestId, int fulfillerScopeId, CancellationToken cancellationToken = default)
    {
        var request = await requestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null) throw new KeyNotFoundException("Request not found");

        if (request.ToScopeNodeId != fulfillerScopeId)
             throw new UnauthorizedAccessException("Only the target supplier can fulfill this request");

        if (request.Status != RequestStatus.Approved)
            throw new InvalidOperationException("Only Approved requests can be fulfilled");

        // Transactional Transfer: Inventory + Wallet
        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            decimal totalAmount = 0;

            foreach (var item in request.Items)
            {
                // 1. Inventory Transfer
                // Deduct from Supplier
                await inventoryService.AddStockMovementAsync(
                    request.ToScopeNodeId, 
                    item.ProductId, 
                    -item.Qty, 
                    StockTxnType.Transfer, 
                    "StockRequest", 
                    request.Id.ToString(), 
                    allowNegative: false, 
                    cancellationToken
                );

                // Add to Requester
                await inventoryService.AddStockMovementAsync(
                    request.FromScopeNodeId, 
                    item.ProductId, 
                    item.Qty, 
                    StockTxnType.Transfer, 
                    "StockRequest", 
                    request.Id.ToString(), 
                    allowNegative: true, 
                    cancellationToken
                );
                
                // 2. Calculate Price for Payment
                // Use PricingService to get effective price (checking assignments for overrides)
                // We use the Supplier's price? Or the Requester's "Cost"?
                // Typically, Supplier charges THEIR price. But if assignment override exists at Supplier level for THIS product?
                // Assuming "GetEffectiveUnitPrice(SupplierScope, Product)" gives the price the Supplier sets/sells at.
                // However, Assignment Override usually means "Override for this node selling downstream".
                // So yes, Supplier's scope override determines the selling price.
                
                var unitPrice = await pricingService.GetEffectiveUnitPriceAsync(request.ToScopeNodeId, item.ProductId, cancellationToken);
                totalAmount += unitPrice * item.Qty;
            }

            // 3. Wallet Transfer
            if (totalAmount > 0)
            {
                // Get Requester Fund Wallet
                var requesterWallet = await walletService.GetWalletAsync(request.FromScopeNodeId, WalletType.Fund, cancellationToken);
                
                // Get Supplier Income Wallet (or Fund?) -> Income usually for sales.
                var supplierWallet = await walletService.GetWalletAsync(request.ToScopeNodeId, WalletType.Income, cancellationToken);
                
                await walletService.ProcessTransferAsync(
                    requesterWallet.Id, 
                    supplierWallet.Id, 
                    totalAmount, 
                    "StockRequest", 
                    request.Id.ToString(), 
                    "Stock Request Fulfillment Payment", 
                    cancellationToken: cancellationToken
                );
            }

            request.Status = RequestStatus.Fulfilled;
            request.FulfilledAt = DateTime.UtcNow;
            await requestRepository.UpdateAsync(request, cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
