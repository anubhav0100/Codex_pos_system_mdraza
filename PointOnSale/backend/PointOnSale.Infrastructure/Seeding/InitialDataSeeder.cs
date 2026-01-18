using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Infrastructure.Data;
using System.Text.Json;

namespace PointOnSale.Infrastructure.Seeding;

public class InitialDataSeeder(PosDbContext dbContext)
{
    public async Task SeedAsync()
    {
        // 0. Seed Default Company (Mandatory for ScopeNode)
        var systemCompany = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.Code == "SYSTEM");

        if (systemCompany == null)
        {
            systemCompany = new Company
            {
                Name = "System Root",
                Code = "SYSTEM",
                Gstin = "NA",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            dbContext.Companies.Add(systemCompany);
            await dbContext.SaveChangesAsync();
        }

        // 1. Seed SuperAdmin Scope
        var superAdminScope = await dbContext.ScopeNodes
            .FirstOrDefaultAsync(s => s.ScopeType == ScopeType.SuperAdmin);

        if (superAdminScope == null)
        {
            superAdminScope = new ScopeNode
            {
                ScopeType = ScopeType.SuperAdmin,
                IsActive = true,
                CompanyId = systemCompany.Id
            };
            dbContext.ScopeNodes.Add(superAdminScope);
            await dbContext.SaveChangesAsync();
        }

        // 2. Seed Default Subscription Plan
        var basicPlan = await dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Name == "Basic");

        if (basicPlan == null)
        {
            var limits = new { MaxUsers = 100, MaxBranches = 10, DurationInDays = 3650 };
            basicPlan = new SubscriptionPlan
            {
                Name = "Basic",
                // Description not present
                MonthlyPrice = 0,
                LimitsJson = JsonSerializer.Serialize(limits),
                IsActive = true
                // CreatedAt not present
            };
            dbContext.SubscriptionPlans.Add(basicPlan);
            await dbContext.SaveChangesAsync();
        }

        // 3. Seed SuperAdmin User
        var superAdminUser = await dbContext.AppUsers
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == "superadmin@pos.local");

        if (superAdminUser == null)
        {
            var user = new AppUser
            {
                Email = "superadmin@pos.local",
                FullName = "Super Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ScopeNodeId = superAdminScope.Id
            };

            var passwordHasher = new PasswordHasher<AppUser>();
            user.PasswordHash = passwordHasher.HashPassword(user, "Admin@12345");

            dbContext.AppUsers.Add(user);
            await dbContext.SaveChangesAsync();
            superAdminUser = user;
        }

        // 4. Assign SuperAdmin Role
        // Reload user to get latest ID if just added, though EF tracking should verify it.
        // Actually, dbContext.AppUsers.Add(user) sets ID.
        
        // Ensure UserRoles collection is loaded if we fetched it, or empty if new.
        if (superAdminUser.UserRoles == null) superAdminUser.UserRoles = new List<UserRole>();

        if (!superAdminUser.UserRoles.Any(ur => ur.Role != null && ur.Role.Code == "SuperAdmin"))
        {
            var superAdminRole = await dbContext.Roles.FirstOrDefaultAsync(r => r.Code == "SuperAdmin");
            if (superAdminRole != null)
            {
                dbContext.UserRoles.Add(new UserRole
                {
                    UserId = superAdminUser.Id,
                    RoleId = superAdminRole.Id
                });
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
