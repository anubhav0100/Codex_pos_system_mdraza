using PointOnSale.Domain.Enums;

namespace PointOnSale.Infrastructure.Seeding.Configs;

public static class RolePermissionMatrix
{
    // Simplified Matrix for demonstration. In real app, this would be very detailed.
    public static Dictionary<string, List<string>> GetMatrix()
    {
        var allModules = PermissionCatalog.Modules;
        var matrix = new Dictionary<string, List<string>>();

        // SuperAdmin: ALL
        var superPerms = GeneratePermissions(allModules.ToArray());
        superPerms.Add("SUPER_ADMIN");
        superPerms.Add("SUPER_COMPANIES_MANAGE");
        matrix["SuperAdmin"] = superPerms;

        // CompanyAdmin: CRUD on Company-level modules
        matrix["CompanyAdmin"] = GeneratePermissions(new[] 
        { 
            "USERS", "ROLES_PERMISSIONS", "LOCATIONS", "SCOPES", "PRODUCT_CATEGORIES", "PRODUCTS", 
            "PRODUCT_ASSIGNMENTS", "INVENTORY", "STOCK_REQUESTS", "WALLET_ACCOUNTS", 
            "POS_SALES", "INVOICES", "REPORTS", "AUDIT_LOGS", "DASHBOARD"
        });

        // Cmanager: limited
        matrix["Cmanager"] = GeneratePermissions(new[] 
        { 
             "PRODUCTS", "INVENTORY", "STOCK_REQUESTS", "POS_SALES", "INVOICES", "REPORTS", "DASHBOARD" 
        }, new[] { PermissionAction.Read, PermissionAction.Create, PermissionAction.Update });

        // Similar logic for others... keeping it brief for the plan but structure is here
        
        return matrix;
    }

    private static List<string> GeneratePermissions(string[] modules, PermissionAction[]? actions = null)
    {
        var list = new List<string>();
        var targetActions = actions ?? new[] { PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete, PermissionAction.Activate, PermissionAction.Assign, PermissionAction.Approve, PermissionAction.Fulfill, PermissionAction.Reject, PermissionAction.Adjust, PermissionAction.Transfer, PermissionAction.ConfirmPayment, PermissionAction.Print, PermissionAction.View, PermissionAction.Manage };

        foreach (var module in modules)
        {
            foreach (var action in targetActions)
            {
                // Verify if this combo exists in catalog to avoid invalids? 
                // For now just generate string, matching catalog logic
                list.Add($"{module}_{action.ToString().ToUpper()}");
            }
        }
        return list;
    }
}
