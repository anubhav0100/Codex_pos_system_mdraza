using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class CompanyRepository(PosDbContext dbContext) : ICompanyRepository
{
    public async Task<Company?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Companies
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }

    public async Task<List<Company>> GetAllAsync(bool? isActive, string? search, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Companies.AsNoTracking().Where(x => !x.IsDeleted);

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search) || x.Gstin.Contains(search));
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Company> AddAsync(Company company, CancellationToken cancellationToken = default)
    {
        dbContext.Companies.Add(company);
        await dbContext.SaveChangesAsync(cancellationToken);
        return company;
    }

    public async Task UpdateAsync(Company company, CancellationToken cancellationToken = default)
    {
        dbContext.Companies.Update(company);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Company company, CancellationToken cancellationToken = default)
    {
        company.IsDeleted = true;
        dbContext.Companies.Update(company);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
