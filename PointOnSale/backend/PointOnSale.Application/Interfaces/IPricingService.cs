using PointOnSale.Application.DTOs.Pricing;

namespace PointOnSale.Application.Interfaces;

public interface IPricingService
{
    Task<decimal> GetEffectiveUnitPriceAsync(int scopeNodeId, int productId, CancellationToken cancellationToken = default);
    
    decimal CalculateTax(decimal amount, decimal taxPercent);
    
    InvoiceTotalDto CalculateInvoiceTotals(IEnumerable<InvoiceLineDto> lines);
}
