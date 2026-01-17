using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class LocationRepository(PosDbContext dbContext) : ILocationRepository
{
    // Countries
    public async Task<List<LocationCountry>> GetAllCountriesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.LocationCountries.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<LocationCountry?> GetCountryByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LocationCountries.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddCountryAsync(LocationCountry country, CancellationToken cancellationToken = default)
    {
        dbContext.LocationCountries.Add(country);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateCountryAsync(LocationCountry country, CancellationToken cancellationToken = default)
    {
        dbContext.LocationCountries.Update(country);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCountryAsync(LocationCountry country, CancellationToken cancellationToken = default)
    {
        dbContext.LocationCountries.Remove(country);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // States
    public async Task<List<LocationState>> GetAllStatesAsync(int? countryId = null, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LocationStates.AsNoTracking().Include(s => s.Country).AsQueryable();
        if (countryId.HasValue)
        {
            query = query.Where(s => s.CountryId == countryId.Value);
        }
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<LocationState?> GetStateByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LocationStates.Include(s => s.Country).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task AddStateAsync(LocationState state, CancellationToken cancellationToken = default)
    {
        dbContext.LocationStates.Add(state);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateStateAsync(LocationState state, CancellationToken cancellationToken = default)
    {
        dbContext.LocationStates.Update(state);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteStateAsync(LocationState state, CancellationToken cancellationToken = default)
    {
        dbContext.LocationStates.Remove(state);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // Districts
    public async Task<List<LocationDistrict>> GetAllDistrictsAsync(int? stateId = null, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LocationDistricts.AsNoTracking().Include(d => d.State).AsQueryable();
        if (stateId.HasValue)
        {
            query = query.Where(d => d.StateId == stateId.Value);
        }
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<LocationDistrict?> GetDistrictByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LocationDistricts.Include(d => d.State).FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task AddDistrictAsync(LocationDistrict district, CancellationToken cancellationToken = default)
    {
        dbContext.LocationDistricts.Add(district);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateDistrictAsync(LocationDistrict district, CancellationToken cancellationToken = default)
    {
        dbContext.LocationDistricts.Update(district);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteDistrictAsync(LocationDistrict district, CancellationToken cancellationToken = default)
    {
        dbContext.LocationDistricts.Remove(district);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // Locals
    public async Task<List<LocationLocal>> GetAllLocalsAsync(int? districtId = null, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LocationLocals.AsNoTracking().Include(l => l.District).AsQueryable();
        if (districtId.HasValue)
        {
            query = query.Where(l => l.DistrictId == districtId.Value);
        }
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<LocationLocal?> GetLocalByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LocationLocals.Include(l => l.District).FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task AddLocalAsync(LocationLocal local, CancellationToken cancellationToken = default)
    {
        dbContext.LocationLocals.Add(local);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateLocalAsync(LocationLocal local, CancellationToken cancellationToken = default)
    {
        dbContext.LocationLocals.Update(local);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteLocalAsync(LocationLocal local, CancellationToken cancellationToken = default)
    {
        dbContext.LocationLocals.Remove(local);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
