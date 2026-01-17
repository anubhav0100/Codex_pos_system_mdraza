using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByEmailWithRolesAsync(string email, CancellationToken cancellationToken = default);
}
