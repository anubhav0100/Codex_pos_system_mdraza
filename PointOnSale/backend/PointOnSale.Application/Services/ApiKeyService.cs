using System.Security.Cryptography;
using System.Text;
using PointOnSale.Application.DTOs.ApiKeys;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Services;

public class ApiKeyService(IApiKeyRepository repository) : IApiKeyService
{
    private const int KeyLength = 32;

    public async Task<ApiKeyDto> CreateAsync(CreateApiKeyDto input, CancellationToken cancellationToken = default)
    {
        var key = GenerateRandomKey();
        var hash = ComputeHash(key);

        var apiKey = new ApiKey
        {
            Name = input.Name,
            CompanyId = input.CompanyId,
            KeyHash = hash,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var saved = await repository.AddAsync(apiKey, cancellationToken);

        return new ApiKeyDto
        {
            Id = saved.Id,
            Name = saved.Name,
            Key = key, // Return plain key only once
            IsActive = saved.IsActive,
            CreatedAt = saved.CreatedAt
        };
    }

    public async Task<ApiKey?> ValidateAsync(string apiKey, CancellationToken cancellationToken = default)
    {
        var hash = ComputeHash(apiKey);
        var keyEntity = await repository.GetByHashAsync(hash, cancellationToken);

        if (keyEntity == null || !keyEntity.IsActive)
        {
            return null;
        }

        return keyEntity;
    }

    public async Task<List<ApiKeyDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new ApiKeyDto
        {
            Id = e.Id,
            Name = e.Name,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt,
            Key = null // Never return key in list
        }).ToList();
    }

    public async Task ToggleStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            entity.IsActive = isActive;
            await repository.UpdateAsync(entity, cancellationToken);
        }
    }

    private static string GenerateRandomKey()
    {
        var bytes = new byte[KeyLength];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string ComputeHash(string input)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
