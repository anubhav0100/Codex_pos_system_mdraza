using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByEmailWithRolesAsync(string email, CancellationToken cancellationToken = default);
    Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<AppUser>> GetAllCompanyAdminsAsync(int companyId, CancellationToken cancellationToken = default);
    Task<AppUser> AddAsync(AppUser user, CancellationToken cancellationToken = default);
    Task UpdateAsync(AppUser user, CancellationToken cancellationToken = default);
    Task<List<AppUser>> GetAllByScopeIdAsync(int scopeId, CancellationToken cancellationToken = default);
    Task UpdateUserRolesAsync(int userId, IEnumerable<int> roleIds, CancellationToken cancellationToken = default);
}
