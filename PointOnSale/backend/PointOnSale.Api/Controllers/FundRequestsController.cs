using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Wallet;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/fund-requests")]
public class FundRequestsController(
    IFundRequestService fundRequestService,
    IFundRequestRepository fundRequestRepository,
    IScopeAccessService scopeAccessService
    ) : ControllerBase
{
    private string GetScopeName(PointOnSale.Domain.Entities.ScopeNode node)
    {
        if (node == null) return "Unknown";
        if (node.Company != null && !string.IsNullOrEmpty(node.Company.Name)) return node.Company.Name;
        if (node.State != null && !string.IsNullOrEmpty(node.State.Name)) return node.State.Name;
        if (node.District != null && !string.IsNullOrEmpty(node.District.Name)) return node.District.Name;
        if (node.Local != null && !string.IsNullOrEmpty(node.Local.Name)) return node.Local.Name;
        
        // Fallback if specific level names are null
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
    [RequirePermission("FUND_REQUESTS_CREATE")]
    public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] CreateFundRequestDto dto)
    {
        int myScopeId = GetUserScopeId();
        // User requesting funds MUST be from their own scope
        if (myScopeId == 0) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "No Scope associated with user"), "Bad Request"));
        
        // Optional: validate user can access fromScope (which is myScopeId) - implicit.

        try
        {
            int id = await fundRequestService.CreateRequestAsync(myScopeId, dto);
            return Ok(ApiResponse<int>.Ok(id));
        }
        catch (InvalidOperationException ex)
        {
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Validation Failed"));
        }
    }

    [HttpPost("{id}/approve")]
    [RequirePermission("FUND_REQUESTS_APPROVE")]
    public async Task<ActionResult<ApiResponse<string>>> Approve(int id)
    {
        var req = await fundRequestRepository.GetByIdAsync(id);
        if (req == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Request Not Found"), "Not Found"));
        
        int myScopeId = GetUserScopeId();
        // Approver must own the TO scope (the scope being requested from)
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, req.ToScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Approver Scope"), "Forbidden"));

        try
        {
            await fundRequestService.ApproveRequestAsync(id, req.ToScopeNodeId);
            return Ok(ApiResponse<string>.Ok("Request Approved"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Failed"));
        }
    }

    [HttpPost("{id}/reject")]
    [RequirePermission("FUND_REQUESTS_APPROVE")] // Same permission as approve
    public async Task<ActionResult<ApiResponse<string>>> Reject(int id, [FromBody] RejectFundRequestDto dto)
    {
        var req = await fundRequestRepository.GetByIdAsync(id);
        if (req == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Request Not Found"), "Not Found"));
        
        int myScopeId = GetUserScopeId();
        if (myScopeId != 0 && !await scopeAccessService.CanAccessScopeAsync(myScopeId, req.ToScopeNodeId))
             return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail(new ErrorDetail("403", "Access Denied to Approver Scope"), "Forbidden"));

        try
        {
            await fundRequestService.RejectRequestAsync(id, req.ToScopeNodeId, dto.Reason);
            return Ok(ApiResponse<string>.Ok("Request Rejected"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", ex.Message), "Failed"));
        }
    }

    [HttpGet("my-requests")]
    [RequirePermission("FUND_REQUESTS_VIEW")]
    public async Task<ActionResult<ApiResponse<List<FundRequestDto>>>> GetMyRequests([FromQuery] bool isIncoming = false)
    {
        int myScopeId = GetUserScopeId();
        if (myScopeId == 0) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "No Scope associated with user"), "Bad Request"));

        var requests = await fundRequestRepository.GetByScopeAsync(myScopeId, isIncoming);
        var dtos = requests.Select(r => new FundRequestDto
        {
            Id = r.Id,
            FromScopeNodeId = r.FromScopeNodeId,
            FromScopeName = GetScopeName(r.FromScopeNode),
            ToScopeNodeId = r.ToScopeNodeId,
            ToScopeName = GetScopeName(r.ToScopeNode),
            Amount = r.Amount,
            Status = r.Status,
            Notes = r.Notes,
            RejectionReason = r.RejectionReason,
            RequestedAt = r.RequestedAt,
            ProcessedAt = r.ProcessedAt
        }).ToList();
        
        return Ok(ApiResponse<List<FundRequestDto>>.Ok(dtos));
    }
}
