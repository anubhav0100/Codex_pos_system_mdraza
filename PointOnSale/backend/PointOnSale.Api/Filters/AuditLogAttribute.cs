using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using System.Security.Claims;
using System.Text.Json;

namespace PointOnSale.Api.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = false)]
public class AuditLogAttribute : ActionFilterAttribute
{
    private readonly string _actionName;

    public AuditLogAttribute(string actionName = null)
    {
        _actionName = actionName;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // 1. Capture Request Info (Before Execution)
        var userIdClaim = context.HttpContext.User.FindFirst("UserId") ?? context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        int userId = 0;
        if (userIdClaim != null) int.TryParse(userIdClaim.Value, out userId);
        
        var ip = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var path = context.HttpContext.Request.Path;
        var method = context.HttpContext.Request.Method;
        
        string requestBody = "";
        // Note: Reading body in MVC requires enabling buffering or it's already bound to arguments.
        // Better to serialize ActionArguments.
        if (context.ActionArguments.Any())
        {
            try { requestBody = JsonSerializer.Serialize(context.ActionArguments); } catch { }
        }

        // 2. Execute Action
        var resultContext = await next();

        // 3. Capture Response Info (After Execution)
        // Only log if successful or specific error? Logging all for audit.
        
        if (userId == 0) return; // Anonymous actions usually not audited or System actions? Audit only authenticated.

        var auditService = context.HttpContext.RequestServices.GetService<IAuditLogService>();
        if (auditService == null) return;

        string responseInfo = "";
        if (resultContext.Result is ObjectResult objResult)
        {
             try { responseInfo = JsonSerializer.Serialize(objResult.Value); } catch { }
        }
        else if (resultContext.Result is StatusCodeResult statusCodeResult)
        {
            responseInfo = $"Status: {statusCodeResult.StatusCode}";
        }
        
        var controllerName = context.Controller.GetType().Name.Replace("Controller", "");
        var actionName = _actionName ?? context.ActionDescriptor.RouteValues["action"] ?? "Unknown";

        var log = new AuditLog
        {
            UserId = userId,
            Action = $"{method} {controllerName}/{actionName}",
            Entity = controllerName,
            EntityId = "", // Hard to extract generic ID without convention. Can parse ActionArgs["id"] if exists.
            BeforeJson = requestBody, // Using BeforeJson for Request Input
            AfterJson = responseInfo, // Using AfterJson for Response Output
            CreatedAt = DateTime.UtcNow,
            Ip = ip
        };
        
        // Try extract ID
        if (context.ActionArguments.TryGetValue("id", out var idObj))
        {
            log.EntityId = idObj?.ToString() ?? "";
        }

        await auditService.LogAsync(log);
    }
}
