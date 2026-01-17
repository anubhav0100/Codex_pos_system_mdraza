namespace PointOnSale.Application.Interfaces;

public interface IPermissionService
{
    Task<HashSet<string>> GetUserPermissionsAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> HasPermissionAsync(int userId, string permissionCode, CancellationToken cancellationToken = default);
}
