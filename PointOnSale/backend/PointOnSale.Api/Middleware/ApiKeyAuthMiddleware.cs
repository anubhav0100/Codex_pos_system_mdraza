using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Constants;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Middleware;

public class ApiKeyAuthMiddleware(RequestDelegate next)
{
    private const string ApiKeyHeaderName = "X-API-KEY";

    public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
    {
        if (!context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var extractedApiKey))
        {
            await next(context);
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var apiKeyService = scope.ServiceProvider.GetRequiredService<IApiKeyService>();

        var apiKeyEntity = await apiKeyService.ValidateAsync(extractedApiKey!);

        if (apiKeyEntity == null)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Fail(new ErrorDetail(ErrorCodes.AUTH_INVALID, "Invalid API Key"));
            await context.Response.WriteAsJsonAsync(response);
            return;
        }

        // Attach to context
        context.Items["CompanyId"] = apiKeyEntity.CompanyId;
        
        // Add minimal claims if needed, but primarily context items for now
        // Or create an Identity override if we want to treat it as a logged-in User

        await next(context);
    }
}
