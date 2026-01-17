using PointOnSale.Application.DTOs.ApiKeys;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IApiKeyService
{
    Task<ApiKeyDto> CreateAsync(CreateApiKeyDto input, CancellationToken cancellationToken = default);
    Task<ApiKey?> ValidateAsync(string apiKey, CancellationToken cancellationToken = default);
    Task<List<ApiKeyDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task ToggleStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default);
}
