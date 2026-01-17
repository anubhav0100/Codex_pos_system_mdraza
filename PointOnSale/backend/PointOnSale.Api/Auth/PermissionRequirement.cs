using Microsoft.AspNetCore.Authorization;

namespace PointOnSale.Api.Auth;

public class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}
