using PointOnSale.Application.DTOs.Invoices;

namespace PointOnSale.Application.Interfaces;

public interface IInvoiceService
{
    Task<InvoiceDto> GenerateInvoiceFromSaleAsync(int salesOrderId, CancellationToken cancellationToken = default);
    Task<InvoiceDto?> GetInvoiceAsync(int id, CancellationToken cancellationToken = default);
    Task<List<InvoiceDto>> GetInvoicesAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default);
    Task<string> GetInvoiceHtmlAsync(int invoiceId, CancellationToken cancellationToken = default);
}
