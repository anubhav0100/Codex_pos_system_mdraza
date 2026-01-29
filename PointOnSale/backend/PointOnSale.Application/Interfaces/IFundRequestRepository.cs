using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IFundRequestRepository
{
    Task<FundRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<FundRequest>> GetByScopeAsync(int scopeNodeId, bool isIncoming, CancellationToken cancellationToken = default);
    Task AddAsync(FundRequest request, CancellationToken cancellationToken = default);
    Task UpdateAsync(FundRequest request, CancellationToken cancellationToken = default);
}
