using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.DTOs.Invoices;
using PointOnSale.Application.DTOs.Pricing;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;
using System.Text;

namespace PointOnSale.Infrastructure.Services;

public class InvoiceService(
    PosDbContext dbContext
    ) : IInvoiceService
{
    private async Task<string> GenerateInvoiceNumberAsync(int companyId, CancellationToken cancellationToken)
    {
        // Simple FY Logic: Starts April. If month < 4, FY = (Year-1)-(Year%100). Else Year-(Year+1)%100.
        // E.g. Jan 2026 -> 25-26. May 2026 -> 26-27.
        var today = DateTime.UtcNow;
        var startYear = today.Month < 4 ? today.Year - 1 : today.Year;
        var endYearPart = (startYear + 1) % 100;
        var fiscalYear = $"{startYear % 100}-{endYearPart}";

        var sequence = await dbContext.InvoiceSequences
            .FirstOrDefaultAsync(s => s.CompanyId == companyId && s.FiscalYear == fiscalYear, cancellationToken);

        if (sequence == null)
        {
            sequence = new InvoiceSequence
            {
                CompanyId = companyId,
                FiscalYear = fiscalYear,
                CurrentSequence = 0
            };
            dbContext.InvoiceSequences.Add(sequence);
        }

        sequence.CurrentSequence++;
        await dbContext.SaveChangesAsync(cancellationToken);

        // Fetch Company Code
        var company = await dbContext.Companies.FindAsync(new object[] { companyId }, cancellationToken);
        var code = company?.Code ?? "INV";

        return $"{code}/{fiscalYear}/{sequence.CurrentSequence:D3}"; // GGL/25-26/001
    }

    public async Task<InvoiceDto> GenerateInvoiceFromSaleAsync(int salesOrderId, CancellationToken cancellationToken = default)
    {
        // 1. Fetch Sale
        var sale = await dbContext.SalesOrders
            .Include(s => s.ScopeNode) // To get CompanyId
            .Include(s => s.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(s => s.Id == salesOrderId, cancellationToken);
            
        if (sale == null) throw new KeyNotFoundException("Sale not found");
        if (sale.Status != SalesStatus.Completed) throw new InvalidOperationException("Can only invoice completed sales");
        
        // Check if invoice already exists?
        // Assuming strictly one invoice per sale for this flow?
        // Or checking via external Ref in Sale? Sale doesn't have InvoiceId yet.
        // For now, allow multiple generations or rely on caller? 
        // Better: Check if any invoice matches this logic?
        // To save time, just generating new one.
        
        var companyId = sale.ScopeNode.CompanyId;
        var invoiceNo = await GenerateInvoiceNumberAsync(companyId, cancellationToken);
        
        var invoice = new Invoice
        {
            CompanyId = companyId,
            ScopeNodeId = sale.ScopeNodeId,
            InvoiceNo = invoiceNo,
            InvoiceDate = DateTime.UtcNow,
            CustomerName = "Walk-in Customer", // TODO: Add customer to Sale if needed
            CustomerPhone = "",
            Gstin = null,
            // Subtotal = sale.Total - sale.TaxTotal, // Removed duplicate
            
            Subtotal = sale.Total,
            TaxTotal = sale.TaxTotal,
            Total = sale.GrandTotal,
            
            InvoiceLines = sale.Items.Select(i => new InvoiceLine
            {
                ProductId = i.ProductId,
                Qty = i.Qty,
                UnitPrice = i.UnitPrice,
                TaxPercent = i.TaxPercent,
                LineTotal = i.LineTotal
            }).ToList()
        };
        
        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(cancellationToken);
        
        return ToDto(invoice);
    }
    
    public async Task<InvoiceDto?> GetInvoiceAsync(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await dbContext.Invoices
            .AsNoTracking()
            .Include(i => i.InvoiceLines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
            
        return invoice == null ? null : ToDto(invoice);
    }

    public async Task<List<InvoiceDto>> GetInvoicesAsync(int scopeNodeId, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Invoices
            .AsNoTracking()
            .Include(i => i.InvoiceLines).ThenInclude(l => l.Product)
            .Where(i => i.ScopeNodeId == scopeNodeId);

        if (dateFrom.HasValue) query = query.Where(i => i.InvoiceDate >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(i => i.InvoiceDate <= dateTo.Value);
        
        var list = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync(cancellationToken);
        return list.Select(ToDto).ToList();
    }

    public async Task<string> GetInvoiceHtmlAsync(int invoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await dbContext.Invoices
            .AsNoTracking()
            .Include(i => i.ScopeNode).ThenInclude(s => s.Company)
            .Include(i => i.ScopeNode).ThenInclude(s => s.State)
            .Include(i => i.ScopeNode).ThenInclude(s => s.District)
            .Include(i => i.ScopeNode).ThenInclude(s => s.Local)
            .Include(i => i.InvoiceLines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(i => i.Id == invoiceId, cancellationToken);

        if (invoice == null) throw new KeyNotFoundException("Invoice not found");
        
        var sb = new StringBuilder();
        sb.Append("<html><head><style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } .total { font-weight: bold; }</style></head><body>");
        sb.Append($"<h1>{invoice.ScopeNode.Company.Name}</h1>");
        sb.Append($"<p>Invoice No: <strong>{invoice.InvoiceNo}</strong><br>Date: {invoice.InvoiceDate:yyyy-MM-dd HH:mm}</p>");
        sb.Append($"<p>Store: {invoice.ScopeNode.Local?.Name}, {invoice.ScopeNode.District?.Name}, {invoice.ScopeNode.State?.Name}</p>");
        
        sb.Append("<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>");
        foreach(var line in invoice.InvoiceLines)
        {
            sb.Append($"<tr><td>{line.Product?.Name}</td><td>{line.Qty}</td><td>{line.UnitPrice:F2}</td><td>{line.LineTotal:F2}</td></tr>");
        }
        sb.Append("</tbody></table>");
        
        sb.Append($"<div style='margin-top:20px; text-align:right;'>");
        sb.Append($"<p>Subtotal: {invoice.Subtotal:F2}</p>");
        sb.Append($"<p>Tax: {invoice.TaxTotal:F2}</p>");
        sb.Append($"<p class='total'>Grand Total: {invoice.Total:F2}</p>");
        sb.Append("</div>");
        
        sb.Append("</body></html>");
        
        return sb.ToString();
    }

    private static InvoiceDto ToDto(Invoice i)
    {
        return new InvoiceDto
        {
            Id = i.Id,
            InvoiceNo = i.InvoiceNo,
            InvoiceDate = i.InvoiceDate,
            CustomerName = i.CustomerName,
            CustomerPhone = i.CustomerPhone,
            Gstin = i.Gstin,
            Subtotal = i.Subtotal,
            TaxTotal = i.TaxTotal,
            Total = i.Total,
            Items = i.InvoiceLines.Select(l => new InvoiceLineDto
            {
                ProductId = l.ProductId,
                Qty = l.Qty,
                UnitPrice = l.UnitPrice,
                TaxPercent = l.TaxPercent,
                // Discount? 
            }).ToList()
        };
    }
}
