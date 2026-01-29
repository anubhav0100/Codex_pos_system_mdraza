using System.Threading;
using System.Threading.Tasks;
using PointOnSale.Application.DTOs.Wallet;

namespace PointOnSale.Application.Interfaces;

public interface IFundRequestService
{
    Task<int> CreateRequestAsync(int fromScopeNodeId, CreateFundRequestDto dto, CancellationToken cancellationToken = default);
    Task ApproveRequestAsync(int requestId, int approverScopeNodeId, CancellationToken cancellationToken = default);
    Task RejectRequestAsync(int requestId, int rejectorScopeNodeId, string reason, CancellationToken cancellationToken = default);
}
