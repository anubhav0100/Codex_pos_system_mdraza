using System.Diagnostics;

namespace PointOnSale.Api.Middleware;

public class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var request = context.Request;

        logger.LogInformation("Incoming Request: {Method} {Path}", request.Method, request.Path);

        await next(context);

        stopwatch.Stop();
        
        logger.LogInformation("Response: {StatusCode} - Duration: {ElapsedMilliseconds}ms", 
            context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
    }
}
