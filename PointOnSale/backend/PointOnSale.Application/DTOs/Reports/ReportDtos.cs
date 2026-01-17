namespace PointOnSale.Application.DTOs.Reports;

public class StockBalanceReportDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string CategoryName { get; set; }
    public int Quantity { get; set; }
}

public class SalesSummaryDto
{
    public DateTime Date { get; set; } // Grouped by Day
    public int Count { get; set; }
    public decimal TotalSales { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int TotalQtySold { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class WalletSummaryDto
{
    public int ScopeNodeId { get; set; }
    public string ScopeName { get; set; }
    public decimal FundBalance { get; set; }
    public decimal IncomeBalance { get; set; }
    public decimal SalesIncentiveBalance { get; set; }
}

public class StockRequestSummaryDto
{
    public int RequestId { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    // Add more fields as needed for summary logic
}
