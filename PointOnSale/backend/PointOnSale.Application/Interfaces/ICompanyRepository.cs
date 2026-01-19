using PointOnSale.Application.DTOs.Companies;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface ICompanyRepository
{
    Task<Company?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<(List<Company> Items, int TotalCount)> GetAllAsync(bool? isActive, string? search, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task<Company> AddAsync(Company company, CancellationToken cancellationToken = default);
    Task UpdateAsync(Company company, CancellationToken cancellationToken = default);
    Task DeleteAsync(Company company, CancellationToken cancellationToken = default);
}
