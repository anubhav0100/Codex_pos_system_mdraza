using System;
using System.Collections.Generic;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class Permission
{
    public int Id { get; set; }
    public string Code { get; set; } // Unique
    public string Module { get; set; }
    public PermissionAction Action { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; }
}
