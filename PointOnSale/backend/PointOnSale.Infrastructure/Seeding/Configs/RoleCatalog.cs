using PointOnSale.Domain.Enums;

namespace PointOnSale.Infrastructure.Seeding.Configs;

public static class RoleCatalog
{
    public static List<Role> GetRoles()
    {
        return new List<Role>
        {
            new() { Name = "Super Admin", Code = "SuperAdmin", Description = "System Super Admin", ScopeType = ScopeType.SuperAdmin },
            
            new() { Name = "S Manager", Code = "Smanager", Description = "Super Manager", ScopeType = ScopeType.SuperAdmin },
            new() { Name = "S Employee", Code = "Semployee", Description = "Super Employee", ScopeType = ScopeType.SuperAdmin },

            new() { Name = "Company Admin", Code = "CompanyAdmin", Description = "Company Administrator", ScopeType = ScopeType.Company },
            new() { Name = "Company Manager", Code = "Cmanager", Description = "Company Manager", ScopeType = ScopeType.Company },
            new() { Name = "Company Employee", Code = "Cemployee", Description = "Company Employee", ScopeType = ScopeType.Company },

            new() { Name = "State Admin", Code = "Stateadmin", Description = "State Administrator", ScopeType = ScopeType.State },
            new() { Name = "State Manager", Code = "Statemanager", Description = "State Manager", ScopeType = ScopeType.State },
            new() { Name = "State Employee", Code = "Stateemployee", Description = "State Employee", ScopeType = ScopeType.State },

            new() { Name = "District Admin", Code = "Districtadmin", Description = "District Administrator", ScopeType = ScopeType.District },
            new() { Name = "District Manager", Code = "Districtmanager", Description = "District Manager", ScopeType = ScopeType.District },
            new() { Name = "District Employee", Code = "DistrictEmployee", Description = "District Employee", ScopeType = ScopeType.District },

            new() { Name = "Local Admin", Code = "Localadmin", Description = "Local Administrator", ScopeType = ScopeType.Local },
            new() { Name = "Local Manager", Code = "Localmanager", Description = "Local Manager", ScopeType = ScopeType.Local },
            new() { Name = "Local Employee", Code = "Localemployee", Description = "Local Employee", ScopeType = ScopeType.Local }
        };
    }
}
