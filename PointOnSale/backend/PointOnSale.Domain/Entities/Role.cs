using System;
using System.Collections.Generic;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class Role
{
    public int Id { get; set; }
    public string Code { get; set; } // Unique
    public string Name { get; set; }
    public ScopeType ScopeType { get; set; }
    public bool IsSystem { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<UserRole> UserRoles { get; set; }
    public ICollection<RolePermission> RolePermissions { get; set; }
}
