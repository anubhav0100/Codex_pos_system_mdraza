using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Infrastructure.Seeding.Configs;

public static class PermissionCatalog
{
    public static List<string> Modules = new()
    {
        "COMPANIES", "COMPANY_ADMINS", "SUBSCRIPTIONS", "SCOPES", "USERS", "ROLES_PERMISSIONS",
        "LOCATIONS", "PRODUCT_CATEGORIES", "PRODUCTS", "PRODUCT_ASSIGNMENTS", "INVENTORY",
        "STOCK_REQUESTS", "WALLET_ACCOUNTS", "POS_SALES", "INVOICES", "REPORTS", "AUDIT_LOGS", "DASHBOARD"
    };

    public static List<Permission> GetPermissions()
    {
        var permissions = new List<Permission>();

        foreach (var module in Modules)
        {
            // Standard CRUD
            permissions.Add(Create(module, PermissionAction.Create));
            permissions.Add(Create(module, PermissionAction.Read));
            permissions.Add(Create(module, PermissionAction.Update));
            permissions.Add(Create(module, PermissionAction.Delete));

            // Special Actions
            switch (module)
            {
                case "COMPANIES":
                case "USERS":
                case "PRODUCTS":
                case "SCOPES":
                case "SUBSCRIPTIONS":
                    permissions.Add(Create(module, PermissionAction.Activate)); // Used for Activate/Deactivate
                    break;
                case "PRODUCT_ASSIGNMENTS":
                    permissions.Add(Create(module, PermissionAction.Assign));
                    break;
                case "STOCK_REQUESTS":
                    permissions.Add(Create(module, PermissionAction.Approve));
                    permissions.Add(Create(module, PermissionAction.Fulfill));
                    permissions.Add(Create(module, PermissionAction.Reject));
                    break;
                case "INVENTORY":
                    permissions.Add(Create(module, PermissionAction.Adjust));
                    break;
                case "WALLET_ACCOUNTS":
                    permissions.Add(Create(module, PermissionAction.Transfer));
                    break;
                case "POS_SALES":
                    permissions.Add(Create(module, PermissionAction.ConfirmPayment));
                    break;
                case "INVOICES":
                    permissions.Add(Create(module, PermissionAction.Print));
                    break;
            }
        }
        
        // Super Admin special permission
        permissions.Add(new Permission { Code = "SUPER_ADMIN", Module = "SYSTEM", Action = PermissionAction.All, Name = "Super Admin Access", Description = "Full System Access" });

        return permissions;
    }

    private static Permission Create(string module, PermissionAction action)
    {
        return new Permission
        {
            Code = $"{module}_{action.ToString().ToUpper()}",
            Module = module,
            Action = action,
            Name = $"{action} {module}",
            Description = $"Allows {action} operations on {module}"
        };
    }
}
