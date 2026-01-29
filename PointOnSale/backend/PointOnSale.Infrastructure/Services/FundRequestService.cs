using System;
using System.Threading;
using System.Threading.Tasks;
using PointOnSale.Application.DTOs.Wallet;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Infrastructure.Services;

public class FundRequestService(
    IFundRequestRepository fundRequestRepository,
    IWalletService walletService,
    IScopeAccessService scopeAccessService // Optional: For validating hierarchy if needed
    ) : IFundRequestService
{
    public async Task<int> CreateRequestAsync(int fromScopeNodeId, CreateFundRequestDto dto, CancellationToken cancellationToken = default)
    {
        // Add business validation here if needed
        var request = new FundRequest
        {
            FromScopeNodeId = fromScopeNodeId,
            ToScopeNodeId = dto.ToScopeNodeId,
            Amount = dto.Amount,
            Status = "PENDING",
            Notes = dto.Notes,
            RequestedAt = DateTime.UtcNow
        };

        await fundRequestRepository.AddAsync(request, cancellationToken);
        return request.Id;
    }

    public async Task ApproveRequestAsync(int requestId, int approverScopeNodeId, CancellationToken cancellationToken = default)
    {
        var request = await fundRequestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null) throw new InvalidOperationException("Request not found");
        
        if (request.ToScopeNodeId != approverScopeNodeId)
            throw new InvalidOperationException("Unauthorized to approve this request");

        if (request.Status != "PENDING")
            throw new InvalidOperationException("Request is not pending");

        // 1. Check/Get Wallets
        var approverWallet = await walletService.GetWalletAsync(approverScopeNodeId, WalletType.Fund, cancellationToken);
        var requesterWallet = await walletService.GetWalletAsync(request.FromScopeNodeId, WalletType.Fund, cancellationToken);

        // 2. Transfer Funds
        // This moves money FROM Approver (Company) TO Requester (Local)
        // Note: Logic might be reverse if "Fund Request" means requesting money FROM company?
        // Yes: "I need funds". Company gives funds.
        // So FromWallet = Approver, ToWallet = Requester.
        
        await walletService.ProcessTransferAsync(
            approverWallet.Id,
            requesterWallet.Id,
            request.Amount,
            "FundRequest",
            request.Id.ToString(),
            $"Fund Request Appoved: {request.Notes}",
            cancellationToken: cancellationToken
        );

        // 3. Update Request Status
        request.Status = "APPROVED";
        request.ProcessedAt = DateTime.UtcNow;
        // request.ProcessedByUserId = userId; // If we had userId passed down

        await fundRequestRepository.UpdateAsync(request, cancellationToken);
    }

    public async Task RejectRequestAsync(int requestId, int rejectorScopeNodeId, string reason, CancellationToken cancellationToken = default)
    {
        var request = await fundRequestRepository.GetByIdAsync(requestId, cancellationToken);
        if (request == null) throw new InvalidOperationException("Request not found");

        if (request.ToScopeNodeId != rejectorScopeNodeId)
            throw new InvalidOperationException("Unauthorized to reject this request");

        if (request.Status != "PENDING")
            throw new InvalidOperationException("Request is not pending");

        request.Status = "REJECTED";
        request.RejectionReason = reason;
        request.ProcessedAt = DateTime.UtcNow;

        await fundRequestRepository.UpdateAsync(request, cancellationToken);
    }
}
