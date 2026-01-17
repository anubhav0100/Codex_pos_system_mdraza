using PointOnSale.Application.DTOs.Pricing;
using PointOnSale.Application.Interfaces;
using PointOnSale.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PointOnSale.Infrastructure.Services;

public class PricingService(
    PosDbContext dbContext
    ) : IPricingService
{
    public async Task<decimal> GetEffectiveUnitPriceAsync(int scopeNodeId, int productId, CancellationToken cancellationToken = default)
    {
        // Check for Assignment Override specifically for this Scope
        var assignment = await dbContext.ProductAssignments
            .AsNoTracking()
            .FirstOrDefaultAsync(pa => pa.ScopeNodeId == scopeNodeId && pa.ProductId == productId, cancellationToken);

        if (assignment != null && assignment.PriceOverride.HasValue)
        {
            return assignment.PriceOverride.Value;
        }

        // Fallback to Product Default Price
        var product = await dbContext.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
            
        if (product == null) return 0; // Or throw exception?
        
        return product.DefaultSalePrice;
    }

    public decimal CalculateTax(decimal amount, decimal taxPercent)
    {
        return amount * (taxPercent / 100m);
    }

    public InvoiceTotalDto CalculateInvoiceTotals(IEnumerable<InvoiceLineDto> lines)
    {
        var result = new InvoiceTotalDto();
        
        foreach (var line in lines)
        {
            var lineTotal = line.UnitPrice * line.Qty;
            var lineDiscount = line.Discount;
            var taxableParams = lineTotal - lineDiscount;
            
            var taxAmount = CalculateTax(taxableParams, line.TaxPercent);
            
            result.SubTotal += lineTotal;
            result.DiscountTotal += lineDiscount;
            result.TaxTotal += taxAmount;
            
            // Add/Merge to TaxLines usually aggregated by Percent
            var existingTaxLine = result.TaxLines.FirstOrDefault(t => t.Percent == line.TaxPercent);
            if (existingTaxLine == null)
            {
                result.TaxLines.Add(new TaxLineDto
                {
                    TaxName = $"GST {line.TaxPercent}%", // Simple naming
                    Percent = line.TaxPercent,
                    Amount = taxAmount
                });
            }
            else
            {
                existingTaxLine.Amount += taxAmount;
            }
        }
        
        result.GrandTotal = result.SubTotal - result.DiscountTotal + result.TaxTotal;
        return result;
    }
}
