using PointOnSale.Application.DTOs.Pos;

namespace PointOnSale.Application.Interfaces;

public interface IPosService
{
    Task<SalesOrderDto> CreateSaleAsync(CreateSaleDto dto, CancellationToken cancellationToken = default);
    Task<SalesOrderDto> ConfirmPaymentAsync(int salesOrderId, ConfirmPaymentDto dto, CancellationToken cancellationToken = default);
    Task<SalesOrderDto?> GetSaleAsync(int id, CancellationToken cancellationToken = default);
    Task<List<SalesOrderDto>> GetSalesAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default);
}
