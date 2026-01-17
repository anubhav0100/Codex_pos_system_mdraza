using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface ILocationRepository
{
    // Countries
    Task<List<LocationCountry>> GetAllCountriesAsync(CancellationToken cancellationToken = default);
    Task<LocationCountry?> GetCountryByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddCountryAsync(LocationCountry country, CancellationToken cancellationToken = default);
    Task UpdateCountryAsync(LocationCountry country, CancellationToken cancellationToken = default);
    Task DeleteCountryAsync(LocationCountry country, CancellationToken cancellationToken = default);

    // States
    Task<List<LocationState>> GetAllStatesAsync(int? countryId = null, CancellationToken cancellationToken = default);
    Task<LocationState?> GetStateByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddStateAsync(LocationState state, CancellationToken cancellationToken = default);
    Task UpdateStateAsync(LocationState state, CancellationToken cancellationToken = default);
    Task DeleteStateAsync(LocationState state, CancellationToken cancellationToken = default);

    // Districts
    Task<List<LocationDistrict>> GetAllDistrictsAsync(int? stateId = null, CancellationToken cancellationToken = default);
    Task<LocationDistrict?> GetDistrictByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddDistrictAsync(LocationDistrict district, CancellationToken cancellationToken = default);
    Task UpdateDistrictAsync(LocationDistrict district, CancellationToken cancellationToken = default);
    Task DeleteDistrictAsync(LocationDistrict district, CancellationToken cancellationToken = default);

    // Locals
    Task<List<LocationLocal>> GetAllLocalsAsync(int? districtId = null, CancellationToken cancellationToken = default);
    Task<LocationLocal?> GetLocalByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddLocalAsync(LocationLocal local, CancellationToken cancellationToken = default);
    Task UpdateLocalAsync(LocationLocal local, CancellationToken cancellationToken = default);
    Task DeleteLocalAsync(LocationLocal local, CancellationToken cancellationToken = default);
}
