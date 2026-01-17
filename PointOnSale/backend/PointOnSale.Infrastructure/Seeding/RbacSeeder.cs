using Microsoft.EntityFrameworkCore;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;
using PointOnSale.Infrastructure.Seeding.Configs;
using Microsoft.Extensions.Logging;

namespace PointOnSale.Infrastructure.Seeding;

public class RbacSeeder(PosDbContext dbContext, ILogger<RbacSeeder> logger)
{
    public async Task<string> SeedAsync(bool allowRevocation = false)
    {
        var summary = new List<string>();

        // 1. Permissions
        var permissions = PermissionCatalog.GetPermissions();
        var existingPermissions = await dbContext.Permissions.ToDictionaryAsync(x => x.Code);
        
        foreach (var p in permissions)
        {
            if (!existingPermissions.ContainsKey(p.Code))
            {
                dbContext.Permissions.Add(p);
                summary.Add($"Added Permission: {p.Code}");
            }
        }
        await dbContext.SaveChangesAsync();

        // 2. Roles
        var roles = RoleCatalog.GetRoles();
        var existingRoles = await dbContext.Roles.ToDictionaryAsync(x => x.Code); // Assuming Code is unique index

        foreach (var r in roles)
        {
            if (!existingRoles.ContainsKey(r.Code))
            {
                dbContext.Roles.Add(r);
                existingRoles.Add(r.Code, r); // Add to local dict for next step
                summary.Add($"Added Role: {r.Code}");
            }
        }
        await dbContext.SaveChangesAsync();

        // 3. RolePermissions
        var matrix = RolePermissionMatrix.GetMatrix();
        var allDbPermissions = await dbContext.Permissions.ToDictionaryAsync(x => x.Code);
        
        foreach (var roleEntry in matrix)
        {
            var roleCode = roleEntry.Key;
            var permCodes = roleEntry.Value;

            if (!existingRoles.TryGetValue(roleCode, out var role)) continue;

            // Get current permissions for this role
            var existingRolePerms = await dbContext.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == role.Id)
                .ToListAsync();

            var existingPermCodes = existingRolePerms.Select(x => x.Permission.Code).ToHashSet();
            var targetPermCodes = permCodes.ToHashSet();

            // Add missing
            foreach (var code in targetPermCodes)
            {
                if (!existingPermCodes.Contains(code))
                {
                    if (allDbPermissions.TryGetValue(code, out var perm))
                    {
                        dbContext.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = perm.Id });
                        summary.Add($"Granted {code} to {roleCode}");
                    }
                    else
                    {
                         logger.LogWarning($"Permission {code} defined in Matrix but not found in DB.");
                    }
                }
            }

            // Revoke extras (if allowed)
            if (allowRevocation)
            {
                foreach (var rp in existingRolePerms)
                {
                    if (!targetPermCodes.Contains(rp.Permission.Code))
                    {
                        dbContext.RolePermissions.Remove(rp);
                        summary.Add($"Revoked {rp.Permission.Code} from {roleCode}");
                    }
                }
            }
        }
        await dbContext.SaveChangesAsync();

        return string.Join("\n", summary);
    }
}
