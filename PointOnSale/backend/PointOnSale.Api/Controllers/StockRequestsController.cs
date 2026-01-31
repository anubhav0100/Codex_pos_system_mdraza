using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Inventory;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/stock-requests")]
public class StockRequestsController(
    IStockRequestService stockRequestService,
    IStockRequestRepository stockRequestRepository, // For Read operations
    IScopeAccessService scopeAccessService
    ) : ControllerBase
{
    private string GetScopeName(PointOnSale.Domain.Entities.ScopeNode node)
    {
        if (node == null) return "";
        if (node.Company != null) return node.Company.Name;
        if (node.State != null) return node.State.Name;
        if (node.District != null) return node.District.Name;
        if (node.Local != null) return node.Local.Name;
        return "Unknown";
    }

    private int GetUserScopeId()
    {
        var claim = User.FindFirst("ScopeNodeId");
        if (claim != null && int.TryParse(claim.Value, out int id))
        {
            return id;
        }
        return 0; 
    }

    [HttpPost]
    [RequirePermission("STOCK_REQUESTS_CREATE")]
    public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] CreateStockRequestDto dto)
    {
        int myScopeId = GetUserScopeId();
        
        if (dto.FromScopeNodeId == 0 && myScopeId != 0)
        {
            dto.FromScopeNodeId = myScopeId;
        }

        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, dto.FromScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Requester Scope"), "Forbidden"));

        try
        {
            int id = await stockRequestService.CreateRequestAsync(dto);
            return Ok(ApiResponse<int>.Ok(id));
        }
        catch (InvalidOperationException ex)
        {
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Validation Failed"));
        }
    }

    [HttpPost("{id}/submit")]
    [RequirePermission("STOCK_REQUESTS_CREATE")] // Creator submits
    public async Task<ActionResult<ApiResponse<string>>> Submit(int id)
    {
        // Permission check: User must own the FROM scope
        var req = await stockRequestRepository.GetByIdAsync(id);
        if (req == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Request Not Found"), "Not Found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, req.FromScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));

        try
        {
            await stockRequestService.SubmitRequestAsync(id);
            return Ok(ApiResponse<string>.Ok("Request Submitted"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Failed"));
        }
    }

    [HttpPost("{id}/approve")]
    [RequirePermission("STOCK_REQUESTS_APPROVE")]
    public async Task<ActionResult<ApiResponse<string>>> Approve(int id)
    {
        // User must own TO scope
        var req = await stockRequestRepository.GetByIdAsync(id);
        if (req == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Request Not Found"), "Not Found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, req.ToScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Supplier Scope"), "Forbidden"));

        try
        {
            await stockRequestService.ApproveRequestAsync(id, req.ToScopeNodeId); // Passing scopeId just to double check inside service if needed, though permission checked here.
            return Ok(ApiResponse<string>.Ok("Request Approved"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Failed"));
        }
    }

    [HttpPost("{id}/reject")]
    [RequirePermission("STOCK_REQUESTS_APPROVE")] // Repurposing approve permission for reject decision
    public async Task<ActionResult<ApiResponse<string>>> Reject(int id, [FromBody] RequestActionDto dto)
    {
        var req = await stockRequestRepository.GetByIdAsync(id);
        if (req == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Request Not Found"), "Not Found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, req.ToScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));

        try
        {
            await stockRequestService.RejectRequestAsync(id, req.ToScopeNodeId, dto.Comments);
            return Ok(ApiResponse<string>.Ok("Request Rejected"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Failed"));
        }
    }

    [HttpPost("{id}/fulfill")]
    [RequirePermission("STOCK_REQUESTS_FULFILL")]
    [Filters.AuditLog]
    public async Task<ActionResult<ApiResponse<string>>> Fulfill(int id)
    {
        var req = await stockRequestRepository.GetByIdAsync(id);
        if (req == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Request Not Found"), "Not Found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, req.ToScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied"), "Forbidden"));

        try
        {
            await stockRequestService.FulfillRequestAsync(id, req.ToScopeNodeId);
            return Ok(ApiResponse<string>.Ok("Request Fulfilled and Inventory Transferred"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Failed"));
        }
    }
    
    [HttpGet]
    [RequirePermission("STOCK_REQUESTS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<StockRequestDto>>>> GetMyRequests([FromQuery] string scope = "mine", [FromQuery] string? status = null)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId == 0) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "No Scope associated with user"), "Bad Request"));

        bool isOutgoing = scope == "mine";
        var requests = await stockRequestRepository.GetByScopeAsync(myScopeId, isOutgoing);
        
        // Apply status filter if provided
        if (!string.IsNullOrEmpty(status))
        {
            requests = requests.Where(r => r.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var dtos = requests.Select(r => new StockRequestDto
        {
            Id = r.Id,
            FromScopeNodeId = r.FromScopeNodeId,
            FromScopeName = GetScopeName(r.FromScopeNode),
            ToScopeNodeId = r.ToScopeNodeId,
            ToScopeName = GetScopeName(r.ToScopeNode),
            Status = r.Status.ToString(),
            RequestedAt = r.RequestedAt,
            ApprovedAt = r.ApprovedAt,
            FulfilledAt = r.FulfilledAt,
            Items = r.Items?.Select(i => new StockRequestItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                Qty = i.Qty
            }).ToList() ?? new List<StockRequestItemDto>()
        }).ToList();
        
        return Ok(ApiResponse<List<StockRequestDto>>.Ok(dtos));
    }
}
