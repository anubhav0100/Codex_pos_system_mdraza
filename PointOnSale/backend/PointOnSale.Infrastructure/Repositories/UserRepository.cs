using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class UserRepository(PosDbContext dbContext) : IUserRepository
{
    public async Task<AppUser?> GetByEmailWithRolesAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.AppUsers
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .Include(u => u.ScopeNode)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.AppUsers
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.ScopeNode)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
    }

    public async Task<List<AppUser>> GetAllCompanyAdminsAsync(int companyId, CancellationToken cancellationToken = default)
    {
        // Assuming Company Admin has role "CompanyAdmin" and ScopeNode.CompanyId == companyId
        // Also checking IsDeleted
        return await dbContext.AppUsers
            .AsNoTracking()
            .Include(u => u.ScopeNode)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => !u.IsDeleted &&
                        u.ScopeNode.CompanyId == companyId &&
                        u.UserRoles.Any(ur => ur.Role.Code == "CompanyAdmin"))
            .ToListAsync(cancellationToken);
    }

    public async Task<AppUser> AddAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        dbContext.AppUsers.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task UpdateAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        dbContext.AppUsers.Update(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<AppUser>> GetAllByScopeIdAsync(int scopeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.AppUsers
            .AsNoTracking()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => !u.IsDeleted && u.ScopeNodeId == scopeId)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateUserRolesAsync(int userId, IEnumerable<int> roleIds, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.AppUsers.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null) return;

        user.UserRoles.Clear();
        foreach (var roleId in roleIds)
        {
            user.UserRoles.Add(new UserRole { RoleId = roleId });
        }
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
