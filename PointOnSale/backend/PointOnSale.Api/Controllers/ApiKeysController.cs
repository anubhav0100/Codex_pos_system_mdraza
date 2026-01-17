using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PointOnSale.Application.DTOs.ApiKeys;
using PointOnSale.Application.Interfaces;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/apikeys")]
[Authorize(Roles = "SuperAdmin,CompanyAdmin")] 
public class ApiKeysController(IApiKeyService apiKeyService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ApiKeyDto>>> Create(CreateApiKeyDto input, CancellationToken cancellationToken)
    {
        var result = await apiKeyService.CreateAsync(input, cancellationToken);
        return Ok(ApiResponse<ApiKeyDto>.Ok(result, "API Key created successfully. Save the Key securely, it will not be shown again."));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ApiKeyDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await apiKeyService.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<List<ApiKeyDto>>.Ok(result));
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<ApiResponse<object>>> ToggleStatus(int id, [FromBody] bool isActive, CancellationToken cancellationToken)
    {
        await apiKeyService.ToggleStatusAsync(id, isActive, cancellationToken);
        return Ok(ApiResponse<object>.Ok(null, "API Key status updated"));
    }
}
