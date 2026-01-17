using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Services;

public class PermissionService(PosDbContext dbContext) : IPermissionService
{
    public async Task<HashSet<string>> GetUserPermissionsAsync(int userId, CancellationToken cancellationToken = default)
    {
        // TODO: Implement caching here (Redis/Memory) as this is called frequently
        var permissions = await dbContext.UserRoles
            .AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .ToListAsync(cancellationToken);

        return permissions.ToHashSet();
    }

    public async Task<bool> HasPermissionAsync(int userId, string permissionCode, CancellationToken cancellationToken = default)
    {
        return await dbContext.UserRoles
            .AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .SelectMany(ur => ur.Role.RolePermissions)
            .AnyAsync(rp => rp.Permission.Code == permissionCode, cancellationToken);
    }
}
