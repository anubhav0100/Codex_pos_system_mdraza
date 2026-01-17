using PointOnSale.Application.DTOs.Auth;

namespace PointOnSale.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
