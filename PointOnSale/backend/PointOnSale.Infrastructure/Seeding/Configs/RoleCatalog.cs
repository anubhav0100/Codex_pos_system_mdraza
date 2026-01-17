using PointOnSale.Domain.Entities;

namespace PointOnSale.Infrastructure.Seeding.Configs;

public static class RoleCatalog
{
    public static List<Role> GetRoles()
    {
        return new List<Role>
        {
            new() { Name = "Super Admin", Code = "SuperAdmin", Description = "System Super Admin" },
            
            new() { Name = "S Manager", Code = "Smanager", Description = "Super Manager" },
            new() { Name = "S Employee", Code = "Semployee", Description = "Super Employee" },

            new() { Name = "Company Admin", Code = "CompanyAdmin", Description = "Company Administrator" },
            new() { Name = "Company Manager", Code = "Cmanager", Description = "Company Manager" },
            new() { Name = "Company Employee", Code = "Cemployee", Description = "Company Employee" },

            new() { Name = "State Admin", Code = "Stateadmin", Description = "State Administrator" },
            new() { Name = "State Manager", Code = "Statemanager", Description = "State Manager" },
            new() { Name = "State Employee", Code = "Stateemployee", Description = "State Employee" },

            new() { Name = "District Admin", Code = "Districtadmin", Description = "District Administrator" },
            new() { Name = "District Manager", Code = "Districtmanager", Description = "District Manager" },
            new() { Name = "District Employee", Code = "DistrictEmployee", Description = "District Employee" },

            new() { Name = "Local Admin", Code = "Localadmin", Description = "Local Administrator" },
            new() { Name = "Local Manager", Code = "Localmanager", Description = "Local Manager" },
            new() { Name = "Local Employee", Code = "Localemployee", Description = "Local Employee" }
        };
    }
}
