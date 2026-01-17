using Microsoft.AspNetCore.Authorization;

namespace PointOnSale.Api.Auth;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false, AllowMultiple = true)]
public class RequirePermissionAttribute(string permissionCode) : AuthorizeAttribute(policy: permissionCode)
{
    public string PermissionCode { get; } = permissionCode;
}
