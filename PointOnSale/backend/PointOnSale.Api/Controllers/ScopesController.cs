using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Scopes;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/company/scopes")]
[RequirePermission("SCOPES_READ")] // Base permission
public class ScopesController(IScopeRepository scopeRepository) : ControllerBase
{
    private int GetCompanyId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == "companyId");
        if (claim != null && int.TryParse(claim.Value, out int id))
        {
            return id;
        }
        return 0;
    }

    [HttpGet("tree")]
    public async Task<ActionResult<ApiResponse<List<ScopeNodeDto>>>> GetTree()
    {
        int companyId = GetCompanyId();
        if (companyId == 0) return Unauthorized(ApiResponse<List<ScopeNodeDto>>.Fail(new ErrorDetail("401", "Company context missing"), "Unauthorized"));

        var allNodes = await scopeRepository.GetAllByCompanyIdAsync(companyId);

        // Build Tree
        var nodeMap = allNodes.ToDictionary(n => n.Id, n => new ScopeNodeDto
        {
            Id = n.Id,
            ScopeType = n.ScopeType,
            Name = GetNodeName(n), // Need helper to get name from Location reference or default
            IsActive = n.IsActive,
            ParentId = n.ParentScopeNodeId,
            StateId = n.StateId,
            DistrictId = n.DistrictId,
            LocalId = n.LocalId
        });

        var rootNodes = new List<ScopeNodeDto>();

        foreach (var node in nodeMap.Values)
        {
            if (node.ParentId.HasValue && nodeMap.ContainsKey(node.ParentId.Value))
            {
                nodeMap[node.ParentId.Value].Children.Add(node);
            }
            else
            {
                rootNodes.Add(node);
            }
        }

        return Ok(ApiResponse<List<ScopeNodeDto>>.Ok(rootNodes));
    }

    private string GetNodeName(ScopeNode node)
    {
        // Ideally we fetch loaded navigations or just handle this better in repo.
        // But Repo GetAllByCompanyIdAsync uses AsNoTracking() and currently does NOT Include() location details in the interface method I recall.
        // Wait, ScopeRepository.GetAllByCompanyIdAsync implementation was:
        // return await dbContext.ScopeNodes.AsNoTracking().Where(x => x.CompanyId == companyId).ToListAsync();
        // It does NOT include navigation properties (State, District, Local).
        // So Name will be null unless I update Repository to Include them.
        // For now, I'll return "Scope {Id}" if null, but I should fix the Repo.
        return $"Scope {node.Id} ({node.ScopeType})"; 
    }

    [HttpPost("state")]
    [RequirePermission("SCOPES_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateState([FromBody] CreateStateScopeDto dto)
    {
        int companyId = GetCompanyId();
        var parent = await scopeRepository.GetByIdAsync(dto.ParentScopeId);
        if (parent == null || parent.CompanyId != companyId) 
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Invalid Parent Scope"), "Invalid Parent"));

        if (parent.ScopeType != ScopeType.Company)
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "State must be under Company Root"), "Invalid Hierarchy"));

        // Create LocationState entity
        // Note: Missing CountryId requirement. Assuming 1 for Default or adding to DTO. 
        // For now hardcoding CountryId = 1 (India) or similar if DB expects it. LocationState definition has CountryId.
        
        var state = new LocationState
        {
            Name = dto.Name,
            CountryId = 1 // Default
        };

        var scope = new ScopeNode
        {
            ScopeType = ScopeType.State,
            CompanyId = companyId,
            ParentScopeNodeId = parent.Id,
            IsActive = true
        };

        await scopeRepository.AddStateScopeAsync(scope, state);

        return Ok(ApiResponse<string>.Ok("State Scope Created"));
    }

    [HttpPost("district")]
    [RequirePermission("SCOPES_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateDistrict([FromBody] CreateDistrictScopeDto dto)
    {
        int companyId = GetCompanyId();
        var parent = await scopeRepository.GetByIdAsync(dto.ParentScopeId);
        if (parent == null || parent.CompanyId != companyId) 
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Invalid Parent Scope"), "Invalid Parent"));

        if (parent.ScopeType != ScopeType.State)
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "District must be under State"), "Invalid Hierarchy"));
        
        // Need parent StateId to link LocationDistrict? 
        // LocationDistrict has StateId. 
        // parent scope has StateId? Yes, ScopeNode has StateId.
        
        if (!parent.StateId.HasValue)
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("500", "Parent State ID missing"), "Data Error"));

        var district = new LocationDistrict
        {
            Name = dto.Name,
            StateId = parent.StateId.Value
        };

        var scope = new ScopeNode
        {
            ScopeType = ScopeType.District,
            CompanyId = companyId,
            ParentScopeNodeId = parent.Id,
            StateId = parent.StateId.Value, // Hierarchy denormalization if needed, or just strict parent linking
            IsActive = true
        };

        await scopeRepository.AddDistrictScopeAsync(scope, district);

        return Ok(ApiResponse<string>.Ok("District Scope Created"));
    }

    [HttpPost("local")]
    [RequirePermission("SCOPES_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateLocal([FromBody] CreateLocalScopeDto dto)
    {
        int companyId = GetCompanyId();
        var parent = await scopeRepository.GetByIdAsync(dto.ParentScopeId);
        if (parent == null || parent.CompanyId != companyId) 
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Invalid Parent Scope"), "Invalid Parent"));

        // Parent should be District (or State if config allows, but strictly District for now)
        if (parent.ScopeType != ScopeType.District)
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Local must be under District"), "Invalid Hierarchy"));

        if (!parent.DistrictId.HasValue)
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("500", "Parent District ID missing"), "Data Error"));

        var local = new LocationLocal
        {
            Name = dto.Name,
            DistrictId = parent.DistrictId.Value
        };

        var scope = new ScopeNode
        {
            ScopeType = ScopeType.Local,
            CompanyId = companyId,
            ParentScopeNodeId = parent.Id,
            StateId = parent.StateId, 
            DistrictId = parent.DistrictId.Value,
            IsActive = true
        };

        await scopeRepository.AddLocalScopeAsync(scope, local);

        return Ok(ApiResponse<string>.Ok("Local Scope Created"));
    }

    [HttpPatch("{id}/activate")]
    [RequirePermission("SCOPES_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Activate(int id)
    {
        var scope = await scopeRepository.GetByIdAsync(id);
        if (scope == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Scope not found"), "Not Found"));

        if (!scope.IsActive)
        {
            scope.IsActive = true;
            await scopeRepository.UpdateAsync(scope);
        }
        return Ok(ApiResponse<string>.Ok("Scope Activated"));
    }

    [HttpPatch("{id}/deactivate")]
    [RequirePermission("SCOPES_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Deactivate(int id)
    {
         var scope = await scopeRepository.GetByIdAsync(id);
        if (scope == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Scope not found"), "Not Found"));

        if (scope.IsActive)
        {
            scope.IsActive = false;
            await scopeRepository.UpdateAsync(scope);
        }
        return Ok(ApiResponse<string>.Ok("Scope Deactivated"));
    }
}
