using System.Net;
using System.Text.Json;
using PointOnSale.Shared.Responses;
using PointOnSale.Shared.Constants;

namespace PointOnSale.Api.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var errorDetail = new ErrorDetail(ErrorCodes.SERVER_ERROR, ex.Message + " " + ex.ToString());
            var response = ApiResponse<object>.Fail(errorDetail);
            var payload = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(payload);
        }
    }
}
