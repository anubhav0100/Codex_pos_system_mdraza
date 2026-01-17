using PointOnSale.Application.DTOs.Reports;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task<List<AuditLogDto>> GetLogsAsync(int? userId, string? entity, string? action, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default);
}
