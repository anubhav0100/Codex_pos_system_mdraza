using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace PointOnSale.Api.Auth;

public class PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : IAuthorizationPolicyProvider
{
    private DefaultAuthorizationPolicyProvider BackupPolicyProvider { get; } = new DefaultAuthorizationPolicyProvider(options);

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => BackupPolicyProvider.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => BackupPolicyProvider.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith("PERMISSION_", StringComparison.OrdinalIgnoreCase) || 
            policyName.Contains('_')) // Heuristic: Our permission codes are like USER_READ, PRODUCT_WRITE
        {
            var policy = new AuthorizationPolicyBuilder();
            policy.AddRequirements(new PermissionRequirement(policyName));
            return Task.FromResult(policy.Build())!;
        }

        return BackupPolicyProvider.GetPolicyAsync(policyName);
    }
}
