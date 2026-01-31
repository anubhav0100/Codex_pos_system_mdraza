using PointOnSale.Application.DTOs.Inventory;

namespace PointOnSale.Application.Interfaces;

public interface IStockRequestService
{
    Task<int> CreateRequestAsync(CreateStockRequestDto dto, int? createdByUserId = null, CancellationToken cancellationToken = default);
    Task SubmitRequestAsync(int requestId, CancellationToken cancellationToken = default);
    Task ApproveRequestAsync(int requestId, int approverScopeId, CancellationToken cancellationToken = default);
    Task RejectRequestAsync(int requestId, int rejectorScopeId, string reason, CancellationToken cancellationToken = default);
    Task FulfillRequestAsync(int requestId, int fulfillerScopeId, CancellationToken cancellationToken = default);
}
