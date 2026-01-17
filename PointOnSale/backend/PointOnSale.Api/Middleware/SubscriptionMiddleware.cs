using System.Security.Claims;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Middleware;

public class SubscriptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Skip if not authenticated
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await next(context);
            return;
        }

        // 2. Skip for SuperAdmin
        // We can check claim or role. Assuming role claim is "role" which maps to ClaimTypes.Role
        if (context.User.IsInRole("SuperAdmin"))
        {
            await next(context);
            return;
        }
        
        // 3. Get CompanyId
        var companyIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == "companyId");
        if (companyIdClaim == null || !int.TryParse(companyIdClaim.Value, out var companyId) || companyId <= 0)
        {
            // If no company context (e.g. system user or error), maybe skip or block? 
            // If they are not SuperAdmin and have no CompanyId, they probably shouldn't be doing much business logic.
            // But let's assume if no companyId, we don't enforce subscription (maybe profile page?).
            await next(context);
            return;
        }

        // 4. Check Subscription
        // Need to resolve scoped service
        var subscriptionRepository = context.RequestServices.GetService<ISubscriptionRepository>();
        if (subscriptionRepository == null)
        {
            await next(context); // Should not happen
            return;
        }

        var activeSubscription = await subscriptionRepository.GetActiveSubscriptionAsync(companyId);
        
        if (activeSubscription == null)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<string>.Fail(new ErrorDetail("SUBSCRIPTION_EXPIRED", "Subscription expired or not found"), "Active subscription required");
            await context.Response.WriteAsJsonAsync(response);
            return;
        }

        await next(context);
    }
}
