using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class ScopeRepository(PosDbContext dbContext) : IScopeRepository
{
    public async Task<List<ScopeNode>> GetAllByCompanyIdAsync(int companyId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ScopeNodes
            .AsNoTracking()
            .Include(scope => scope.Company)
            .Include(scope => scope.State)
            .Include(scope => scope.District)
            .Include(scope => scope.Local)
            .Where(x => x.CompanyId == companyId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ScopeNode>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.ScopeNodes
            .AsNoTracking()
            .Include(scope => scope.Company)
            .Include(scope => scope.State)
            .Include(scope => scope.District)
            .Include(scope => scope.Local)
            .ToListAsync(cancellationToken);
    }

    public async Task<ScopeNode?> GetRootScopeAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.ScopeNodes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ScopeType == PointOnSale.Domain.Enums.ScopeType.SuperAdmin, cancellationToken);
    }

    public async Task<ScopeNode?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ScopeNodes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ScopeNode> AddAsync(ScopeNode scopeNode, CancellationToken cancellationToken = default)
    {
        dbContext.ScopeNodes.Add(scopeNode);
        await dbContext.SaveChangesAsync(cancellationToken);
        return scopeNode;
    }

    public async Task<ScopeNode> AddStateScopeAsync(ScopeNode scope, LocationState state, CancellationToken cancellationToken = default)
    {
        dbContext.LocationStates.Add(state);
        // Ensure state is saved to get Id? Or EF Core handles graph.
        // We need state Id for scope.StateId.
        // It's better to add state, save, then scope. Or link navigation.
        
        scope.State = state;
        dbContext.ScopeNodes.Add(scope);
        await dbContext.SaveChangesAsync(cancellationToken);
        return scope;
    }

    public async Task<ScopeNode> AddDistrictScopeAsync(ScopeNode scope, LocationDistrict district, CancellationToken cancellationToken = default)
    {
        scope.District = district;
        dbContext.ScopeNodes.Add(scope);
        await dbContext.SaveChangesAsync(cancellationToken);
        return scope;
    }

    public async Task<ScopeNode> AddLocalScopeAsync(ScopeNode scope, LocationLocal local, CancellationToken cancellationToken = default)
    {
        scope.Local = local;
        dbContext.ScopeNodes.Add(scope);
        await dbContext.SaveChangesAsync(cancellationToken);
        return scope;
    }

    public async Task UpdateAsync(ScopeNode scope, CancellationToken cancellationToken = default)
    {
        dbContext.ScopeNodes.Update(scope);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(ScopeNode scope, CancellationToken cancellationToken = default)
    {
        dbContext.ScopeNodes.Remove(scope);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
