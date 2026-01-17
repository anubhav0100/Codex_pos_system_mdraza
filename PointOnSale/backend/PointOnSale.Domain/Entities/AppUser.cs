using System;
using System.Collections.Generic;

namespace PointOnSale.Domain.Entities;

public class AppUser
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string PasswordHash { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }

    public int? ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }

    public ICollection<UserRole> UserRoles { get; set; }
}
