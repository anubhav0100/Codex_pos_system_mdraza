using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.DTOs.Reports;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class ReportsService(PosDbContext dbContext) : IReportsService
{
    public async Task<List<StockBalanceReportDto>> GetStockBalanceAsync(int scopeNodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.StockBalances
            .AsNoTracking()
            .Where(sb => sb.ScopeNodeId == scopeNodeId)
            .Include(sb => sb.Product).ThenInclude(p => p.Category)
            .Select(sb => new StockBalanceReportDto
            {
                ProductId = sb.ProductId,
                ProductName = sb.Product.Name,
                CategoryName = sb.Product.Category.Name,
                Quantity = sb.QtyOnHand
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<SalesSummaryDto>> GetSalesSummaryAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default)
    {
        var query = dbContext.SalesOrders.AsNoTracking().Where(s => s.ScopeNodeId == scopeNodeId && s.Status == SalesStatus.Completed);
        
        if (dateFrom.HasValue) query = query.Where(s => s.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(s => s.CreatedAt <= dateTo.Value);

        var grouped = await query
            .GroupBy(s => s.CreatedAt.Date)
            .Select(g => new SalesSummaryDto
            {
                Date = g.Key,
                Count = g.Count(),
                TotalSales = g.Sum(x => x.GrandTotal)
            })
            .OrderBy(x => x.Date)
            .ToListAsync(cancellationToken);

        return grouped;
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, int topN = 5, CancellationToken cancellationToken = default)
    {
        var query = dbContext.SalesOrderItems.AsNoTracking()
            .Include(i => i.SalesOrder)
            .Where(i => i.SalesOrder.ScopeNodeId == scopeNodeId && i.SalesOrder.Status == SalesStatus.Completed);

        if (dateFrom.HasValue) query = query.Where(i => i.SalesOrder.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(i => i.SalesOrder.CreatedAt <= dateTo.Value);

        var top = await query
            .GroupBy(i => new { i.ProductId, i.Product.Name })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                TotalQtySold = g.Sum(x => x.Qty),
                TotalRevenue = g.Sum(x => x.LineTotal)
            })
            .OrderByDescending(x => x.TotalQtySold)
            .Take(topN)
            .ToListAsync(cancellationToken);

        return top;
    }

    public async Task<WalletSummaryDto> GetWalletSummaryAsync(int scopeNodeId, CancellationToken cancellationToken = default)
    {
        var wallets = await dbContext.WalletAccounts
            .AsNoTracking()
            .Include(w => w.ScopeNode).ThenInclude(s => s.Company)
            .Include(w => w.ScopeNode).ThenInclude(s => s.Local)
            .Include(w => w.ScopeNode).ThenInclude(s => s.District)
            .Include(w => w.ScopeNode).ThenInclude(s => s.State)
            .Where(w => w.ScopeNodeId == scopeNodeId)
            .ToListAsync(cancellationToken);

        var scope = wallets.FirstOrDefault()?.ScopeNode;
        var scopeName = scope?.Local?.Name 
                     ?? scope?.District?.Name 
                     ?? scope?.State?.Name 
                     ?? scope?.Company?.Name 
                     ?? "Unknown";

        return new WalletSummaryDto
        {
            ScopeNodeId = scopeNodeId,
            ScopeName = scopeName,
            FundBalance = wallets.FirstOrDefault(w => w.WalletType == WalletType.Fund)?.Balance ?? 0,
            IncomeBalance = wallets.FirstOrDefault(w => w.WalletType == WalletType.Income)?.Balance ?? 0,
            SalesIncentiveBalance = wallets.FirstOrDefault(w => w.WalletType == WalletType.SalesIncentive)?.Balance ?? 0
        };
    }

    public async Task<List<StockRequestSummaryDto>> GetStockRequestsSummaryAsync(int scopeNodeId, string? status, CancellationToken cancellationToken = default)
    {
        // Requests WHERE this scope is REQUESTER? or SUPPLIER? Assuming Requester for summary logic.
        // Actually, could be either. Let's return where Scope is Requester.
        
        var query = dbContext.StockRequests
            .AsNoTracking()
            .Where(r => r.FromScopeNodeId == scopeNodeId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<RequestStatus>(status, true, out var statusEnum))
        {
            query = query.Where(r => r.Status == statusEnum);
        }

        return await query.Select(r => new StockRequestSummaryDto
        {
            RequestId = r.Id,
            Status = r.Status.ToString(),
            CreatedAt = r.RequestedAt
        }).ToListAsync(cancellationToken);
    }
}
