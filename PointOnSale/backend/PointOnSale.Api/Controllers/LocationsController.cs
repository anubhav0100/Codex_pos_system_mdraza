using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Locations;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/locations")]
public class LocationsController(ILocationRepository locationRepository) : ControllerBase
{
    // Countries
    [HttpGet("countries")]
    [RequirePermission("LOCATIONS_READ")]
    public async Task<ActionResult<ApiResponse<List<CountryDto>>>> GetAllCountries()
    {
        var countries = await locationRepository.GetAllCountriesAsync();
        var dtos = countries.Select(c => new CountryDto { Id = c.Id, Name = c.Name }).ToList();
        return Ok(ApiResponse<List<CountryDto>>.Ok(dtos));
    }

    [HttpPost("countries")]
    [RequirePermission("LOCATIONS_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateCountry([FromBody] CreateCountryDto dto)
    {
        var country = new LocationCountry { Name = dto.Name };
        await locationRepository.AddCountryAsync(country);
        return Ok(ApiResponse<string>.Ok("Country created successfully"));
    }

    [HttpPut("countries/{id}")]
    [RequirePermission("LOCATIONS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateCountry(int id, [FromBody] UpdateCountryDto dto)
    {
        var country = await locationRepository.GetCountryByIdAsync(id);
        if (country == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Country not found"), "Not Found"));

        country.Name = dto.Name;
        await locationRepository.UpdateCountryAsync(country);
        return Ok(ApiResponse<string>.Ok("Country updated successfully"));
    }

    [HttpDelete("countries/{id}")]
    [RequirePermission("LOCATIONS_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteCountry(int id)
    {
        var country = await locationRepository.GetCountryByIdAsync(id);
        if (country == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Country not found"), "Not Found"));
        
        // Note: Strict FK constraints might cause this to fail if states exist.
        try 
        {
            await locationRepository.DeleteCountryAsync(country);
        }
        catch (Exception)
        {
             return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Cannot delete country with existing states"), "Deletion Failed"));
        }
        return Ok(ApiResponse<string>.Ok("Country deleted successfully"));
    }

    // States
    [HttpGet("states")]
    [RequirePermission("LOCATIONS_READ")]
    public async Task<ActionResult<ApiResponse<List<StateDto>>>> GetAllStates([FromQuery] int? countryId)
    {
        var states = await locationRepository.GetAllStatesAsync(countryId);
        var dtos = states.Select(s => new StateDto 
        { 
            Id = s.Id, 
            Name = s.Name, 
            CountryId = s.CountryId, 
            CountryName = s.Country?.Name ?? "" 
        }).ToList();
        return Ok(ApiResponse<List<StateDto>>.Ok(dtos));
    }

    [HttpPost("states")]
    [RequirePermission("LOCATIONS_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateState([FromBody] CreateStateDto dto)
    {
        var country = await locationRepository.GetCountryByIdAsync(dto.CountryId);
        if (country == null) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Invalid Country ID"), "Invalid Data"));

        var state = new LocationState { Name = dto.Name, CountryId = dto.CountryId };
        await locationRepository.AddStateAsync(state);
        return Ok(ApiResponse<string>.Ok("State created successfully"));
    }

    [HttpPut("states/{id}")]
    [RequirePermission("LOCATIONS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateState(int id, [FromBody] UpdateStateDto dto)
    {
        var state = await locationRepository.GetStateByIdAsync(id);
        if (state == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "State not found"), "Not Found"));

        state.Name = dto.Name;
        state.CountryId = dto.CountryId;
        
        // Verify country if changed? 
        // Logic simplified for now, assuming FE provides valid ID or DB constraint catches.
        
        await locationRepository.UpdateStateAsync(state);
        return Ok(ApiResponse<string>.Ok("State updated successfully"));
    }

    [HttpDelete("states/{id}")]
    [RequirePermission("LOCATIONS_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteState(int id)
    {
        var state = await locationRepository.GetStateByIdAsync(id);
        if (state == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "State not found"), "Not Found"));
        
        try
        {
            await locationRepository.DeleteStateAsync(state);
        }
        catch (Exception)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Cannot delete state with existing districts"), "Deletion Failed"));
        }
        return Ok(ApiResponse<string>.Ok("State deleted successfully"));
    }

    // Districts
    [HttpGet("districts")]
    [RequirePermission("LOCATIONS_READ")]
    public async Task<ActionResult<ApiResponse<List<DistrictDto>>>> GetAllDistricts([FromQuery] int? stateId)
    {
        var districts = await locationRepository.GetAllDistrictsAsync(stateId);
        var dtos = districts.Select(d => new DistrictDto 
        { 
            Id = d.Id, 
            Name = d.Name, 
            StateId = d.StateId, 
            StateName = d.State?.Name ?? "" 
        }).ToList();
        return Ok(ApiResponse<List<DistrictDto>>.Ok(dtos));
    }

    [HttpPost("districts")]
    [RequirePermission("LOCATIONS_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateDistrict([FromBody] CreateDistrictDto dto)
    {
        var state = await locationRepository.GetStateByIdAsync(dto.StateId);
        if (state == null) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Invalid State ID"), "Invalid Data"));

        var district = new LocationDistrict { Name = dto.Name, StateId = dto.StateId };
        await locationRepository.AddDistrictAsync(district);
        return Ok(ApiResponse<string>.Ok("District created successfully"));
    }

    [HttpPut("districts/{id}")]
    [RequirePermission("LOCATIONS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateDistrict(int id, [FromBody] UpdateDistrictDto dto)
    {
        var district = await locationRepository.GetDistrictByIdAsync(id);
        if (district == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "District not found"), "Not Found"));

        district.Name = dto.Name;
        district.StateId = dto.StateId;
        await locationRepository.UpdateDistrictAsync(district);
        return Ok(ApiResponse<string>.Ok("District updated successfully"));
    }

    [HttpDelete("districts/{id}")]
    [RequirePermission("LOCATIONS_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteDistrict(int id)
    {
        var district = await locationRepository.GetDistrictByIdAsync(id);
        if (district == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "District not found"), "Not Found"));
        
        try
        {
            await locationRepository.DeleteDistrictAsync(district);
        }
        catch (Exception)
        {
            return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Cannot delete district with existing locals"), "Deletion Failed"));
        }
        return Ok(ApiResponse<string>.Ok("District deleted successfully"));
    }

    // Locals
    [HttpGet("locals")]
    [RequirePermission("LOCATIONS_READ")]
    public async Task<ActionResult<ApiResponse<List<LocalDto>>>> GetAllLocals([FromQuery] int? districtId)
    {
        var locals = await locationRepository.GetAllLocalsAsync(districtId);
        var dtos = locals.Select(l => new LocalDto 
        { 
            Id = l.Id, 
            Name = l.Name, 
            DistrictId = l.DistrictId, 
            DistrictName = l.District?.Name ?? "" 
        }).ToList();
        return Ok(ApiResponse<List<LocalDto>>.Ok(dtos));
    }

    [HttpPost("locals")]
    [RequirePermission("LOCATIONS_CREATE")]
    public async Task<ActionResult<ApiResponse<string>>> CreateLocal([FromBody] CreateLocalDto dto)
    {
        var district = await locationRepository.GetDistrictByIdAsync(dto.DistrictId);
        if (district == null) return BadRequest(ApiResponse<string>.Fail(new ErrorDetail("400", "Invalid District ID"), "Invalid Data"));

        var local = new LocationLocal { Name = dto.Name, DistrictId = dto.DistrictId };
        await locationRepository.AddLocalAsync(local);
        return Ok(ApiResponse<string>.Ok("Local created successfully"));
    }

    [HttpPut("locals/{id}")]
    [RequirePermission("LOCATIONS_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateLocal(int id, [FromBody] UpdateLocalDto dto)
    {
        var local = await locationRepository.GetLocalByIdAsync(id);
        if (local == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Local not found"), "Not Found"));

        local.Name = dto.Name;
        local.DistrictId = dto.DistrictId;
        await locationRepository.UpdateLocalAsync(local);
        return Ok(ApiResponse<string>.Ok("Local updated successfully"));
    }

    [HttpDelete("locals/{id}")]
    [RequirePermission("LOCATIONS_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteLocal(int id)
    {
        var local = await locationRepository.GetLocalByIdAsync(id);
        if (local == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Local not found"), "Not Found"));
        
        await locationRepository.DeleteLocalAsync(local);
        return Ok(ApiResponse<string>.Ok("Local deleted successfully"));
    }
}
