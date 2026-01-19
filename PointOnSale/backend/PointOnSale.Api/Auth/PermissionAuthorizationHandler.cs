using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using PointOnSale.Application.Interfaces;

namespace PointOnSale.Api.Auth;

public class PermissionAuthorizationHandler(
    IServiceProvider serviceProvider) : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier) ?? context.User.FindFirst("sub");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return;
        }

        // 0. SuperAdmin bypass
        if (context.User.IsInRole("SuperAdmin") || context.User.HasClaim("permission", "SUPER_ADMIN"))
        {
            context.Succeed(requirement);
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var permissionService = scope.ServiceProvider.GetRequiredService<IPermissionService>();
        var scopeAccessService = scope.ServiceProvider.GetRequiredService<IScopeAccessService>();
        var httpContextAccessor = scope.ServiceProvider.GetRequiredService<IHttpContextAccessor>();
        var httpContext = httpContextAccessor.HttpContext;

        // 1. Check Permission (Claims first, then DB)
        // Optimization: For this example, we'll check DB via service which is cleaner, 
        // but normally we might put permissions in claims if token size permits.
        // Assuming current setup doesn't put ALL permissions in claims to keep token small.
        
        var hasPermission = await permissionService.HasPermissionAsync(userId, requirement.Permission);
        if (!hasPermission)
        {
            return; // Permission denied
        }

        // 2. Check Scope Access (if scopeNodeId is present in request)
        if (httpContext != null)
        {
            var scopeIdString = httpContext.Request.Query["scopeNodeId"].ToString();
            if (string.IsNullOrEmpty(scopeIdString))
            {
                // Try route values
                if (httpContext.Request.RouteValues.TryGetValue("scopeNodeId", out var routeScopeId))
                {
                    scopeIdString = routeScopeId?.ToString();
                }
            }

            if (!string.IsNullOrEmpty(scopeIdString) && int.TryParse(scopeIdString, out var targetScopeId))
            {
                // Get user's current scope from claims (AuthService puts it there)
                var userScopeIdClaim = context.User.FindFirst("scopeNodeId");
                if (userScopeIdClaim != null && int.TryParse(userScopeIdClaim.Value, out var userScopeId))
                {
                    // SuperAdmin bypass (optional, dependent on role design. Assuming Role check isn't enough, we check scope logic)
                    // If user is SuperAdmin, maybe they have root scope? 
                    // Let's rely on ScopeAccessService. If ScopeAccessService says yes, then yes.
                    
                    var canAccessScope = await scopeAccessService.CanAccessScopeAsync(userScopeId, targetScopeId);
                    if (!canAccessScope)
                    {
                        return; // Scope denied
                    }
                }
                else
                {
                    // User has no scope defined? If system requires scope, this is a fail.
                    // If this is a specialized user type (e.g. system bot), might strictly need handling.
                    // For now, assume regular users must have a scope.
                    return; 
                }
            }
        }

        context.Succeed(requirement);
    }
}
