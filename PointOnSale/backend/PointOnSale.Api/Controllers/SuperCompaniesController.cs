using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Companies;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/super/companies")]
[RequirePermission("SUPER_ADMIN")]
public class SuperCompaniesController(
    ICompanyRepository companyRepository,
    IScopeRepository scopeRepository,
    ILocationRepository locationRepository) : ControllerBase
{
    [HttpPost]
    [RequirePermission("SUPER_COMPANIES_MANAGE")]
    [Filters.AuditLog]
    public async Task<ActionResult<ApiResponse<dynamic>>> Create([FromBody] CompanyDto dto)
    {
        var company = new Company
        {
            Name = dto.Name,
            Code = dto.Code ?? dto.Name.Replace(" ", "").ToUpper(),
            Gstin = string.IsNullOrWhiteSpace(dto.Gstin) ? "NA" : dto.Gstin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await companyRepository.AddAsync(company);

        // Create Hierarchy: Company -> State -> District -> Local
        var rootScope = await scopeRepository.GetRootScopeAsync();
        
        var companyScope = new ScopeNode
        {
            ScopeType = ScopeType.Company,
            CompanyId = company.Id,
            ParentScopeNodeId = rootScope?.Id, // Link to System Root
            IsActive = true
        };
        await scopeRepository.AddAsync(companyScope);

        // State
        var countries = await locationRepository.GetAllCountriesAsync();
        var defaultCountry = countries.FirstOrDefault();
        
        if (defaultCountry == null)
            return BadRequest(ApiResponse<dynamic>.Fail(new ErrorDetail("400", "No countries found in master data. Please seed LocationCountries first."), "Setup incomplete"));

        var state = new LocationState { Name = $"{company.Name} - Main State", CountryId = defaultCountry.Id };
        await locationRepository.AddStateAsync(state);

        var stateScope = new ScopeNode
        {
            ScopeType = ScopeType.State,
            CompanyId = company.Id,
            ParentScopeNodeId = companyScope.Id,
            StateId = state.Id,
            IsActive = true
        };
        await scopeRepository.AddAsync(stateScope);

        // District
        var district = new LocationDistrict { Name = $"{company.Name} - Main District", StateId = state.Id };
        await locationRepository.AddDistrictAsync(district);

        var districtScope = new ScopeNode
        {
            ScopeType = ScopeType.District,
            CompanyId = company.Id,
            ParentScopeNodeId = stateScope.Id,
            StateId = state.Id,
            DistrictId = district.Id,
            IsActive = true
        };
        await scopeRepository.AddAsync(districtScope);

        // Local
        var local = new LocationLocal { Name = $"{company.Name} - Default Office", DistrictId = district.Id };
        await locationRepository.AddLocalAsync(local);

        var localScope = new ScopeNode
        {
            ScopeType = ScopeType.Local,
            CompanyId = company.Id,
            ParentScopeNodeId = districtScope.Id,
            StateId = state.Id,
            DistrictId = district.Id,
            LocalId = local.Id,
            IsActive = true
        };
        await scopeRepository.AddAsync(localScope);

        return Ok(ApiResponse<dynamic>.Ok(new 
        { 
            Id = company.Id, 
            CompanyScopeId = companyScope.Id,
            StateScopeId = stateScope.Id,
            DistrictScopeId = districtScope.Id,
            LocalScopeId = localScope.Id
        }, "Company and full scope hierarchy created successfully"));
    }

    [HttpGet]
    [RequirePermission("COMPANIES_READ")]
    public async Task<ActionResult<ApiResponse<PaginatedResult<CompanyDto>>>> GetAll(
        [FromQuery] string? status, 
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        bool? isActive = status switch
        {
            "ACTIVE" => true,
            "INACTIVE" => false,
            _ => null
        };

        var (companies, totalCount) = await companyRepository.GetAllAsync(isActive, search, page, pageSize);
        
        var dtos = companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            Name = c.Name,
            Gstin = c.Gstin,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        }).ToList();

        var result = new PaginatedResult<CompanyDto>(dtos, totalCount, page, pageSize);
        return Ok(ApiResponse<PaginatedResult<CompanyDto>>.Ok(result));
    }

    [HttpPut("{id}")]
    [RequirePermission("COMPANIES_UPDATE")]
    public async Task<ActionResult<ApiResponse<string>>> Update(int id, [FromBody] UpdateCompanyDto dto)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        company.Name = dto.Name;
        company.Gstin = dto.Gstin;

        await companyRepository.UpdateAsync(company);
        return Ok(ApiResponse<CompanyDto>.Ok(new CompanyDto { Id = company.Id, Name = company.Name, Gstin = company.Gstin, IsActive = company.IsActive }, "Company updated successfully"));
    }

    [HttpDelete("{id}")]
    [RequirePermission("COMPANIES_DELETE")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        await companyRepository.DeleteAsync(company); // Soft delete implemented in Repo
        return Ok(ApiResponse<string>.Ok("Company deleted successfully"));
    }

    [HttpPatch("{id}/activate")]
    [RequirePermission("COMPANIES_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Activate(int id)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        if (!company.IsActive)
        {
            company.IsActive = true;
            await companyRepository.UpdateAsync(company);
        }
        return Ok(ApiResponse<string>.Ok("Company activated successfully"));
    }

    [HttpPatch("{id}/deactivate")]
    [RequirePermission("COMPANIES_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> Deactivate(int id)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        if (company.IsActive)
        {
            company.IsActive = false;
            await companyRepository.UpdateAsync(company);
        }
        return Ok(ApiResponse<string>.Ok("Company deactivated successfully"));
    }

    public class StatusDto { public bool IsActive { get; set; } }

    [HttpPatch("{id}/status")]
    [RequirePermission("COMPANIES_ACTIVATE")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateStatus(int id, [FromBody] StatusDto dto)
    {
        var company = await companyRepository.GetByIdAsync(id);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        company.IsActive = dto.IsActive;
        await companyRepository.UpdateAsync(company);
        
        return Ok(ApiResponse<string>.Ok($"Company {(dto.IsActive ? "activated" : "deactivated")} successfully"));
    }
}
