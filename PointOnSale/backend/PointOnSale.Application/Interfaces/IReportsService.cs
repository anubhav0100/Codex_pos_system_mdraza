using PointOnSale.Application.DTOs.Reports;

namespace PointOnSale.Application.Interfaces;

public interface IReportsService
{
    Task<List<StockBalanceReportDto>> GetStockBalanceAsync(int scopeNodeId, CancellationToken cancellationToken = default);
    Task<List<SalesSummaryDto>> GetSalesSummaryAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default);
    Task<List<TopProductDto>> GetTopProductsAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, int topN = 5, CancellationToken cancellationToken = default);
    Task<WalletSummaryDto> GetWalletSummaryAsync(int scopeNodeId, CancellationToken cancellationToken = default);
    Task<List<StockRequestSummaryDto>> GetStockRequestsSummaryAsync(int scopeNodeId, string? status, CancellationToken cancellationToken = default);
}
