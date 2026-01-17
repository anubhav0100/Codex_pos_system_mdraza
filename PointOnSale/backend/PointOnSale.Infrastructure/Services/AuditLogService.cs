using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.DTOs.Reports;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class AuditLogService(PosDbContext dbContext) : IAuditLogService
{
    public async Task LogAsync(AuditLog log, CancellationToken cancellationToken = default)
    {
        dbContext.AuditLogs.Add(log);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<AuditLogDto>> GetLogsAsync(int? userId, string? entity, string? action, DateTime? dateFrom, DateTime? dateTo, CancellationToken cancellationToken = default)
    {
        var query = dbContext.AuditLogs.AsNoTracking().Include(l => l.User).AsQueryable();

        if (userId.HasValue) query = query.Where(l => l.UserId == userId.Value);
        if (!string.IsNullOrEmpty(entity)) query = query.Where(l => l.Entity == entity);
        if (!string.IsNullOrEmpty(action)) query = query.Where(l => l.Action == action);
        if (dateFrom.HasValue) query = query.Where(l => l.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(l => l.CreatedAt <= dateTo.Value);

        return await query.OrderByDescending(l => l.CreatedAt)
            .Select(l => new AuditLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                UserName = l.User.Name,
                Action = l.Action,
                Entity = l.Entity,
                EntityId = l.EntityId,
                BeforeJson = l.BeforeJson,
                AfterJson = l.AfterJson,
                CreatedAt = l.CreatedAt,
                Ip = l.Ip
            })
            .ToListAsync(cancellationToken);
    }
}
