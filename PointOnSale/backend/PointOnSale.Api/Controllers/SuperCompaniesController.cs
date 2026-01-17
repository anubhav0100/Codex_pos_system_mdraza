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
    IScopeRepository scopeRepository) : ControllerBase
{
    [HttpPost]
    [RequirePermission("COMPANIES_CREATE")]
    public async Task<ActionResult<ApiResponse<dynamic>>> Create([FromBody] CreateCompanyDto dto)
    {
        var company = new Company
        {
            Name = dto.Name,
            Gstin = dto.Gstin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await companyRepository.AddAsync(company);

        var rootScope = new ScopeNode
        {
            ScopeType = ScopeType.Company,
            CompanyId = company.Id,
            IsActive = true,
            // Root scope has no parent
        };
        
        await scopeRepository.AddAsync(rootScope);

        return Ok(ApiResponse<dynamic>.Ok(new { CompanyId = company.Id, RootScopeNodeId = rootScope.Id }, "Company created successfully"));
    }

    [HttpGet]
    [RequirePermission("COMPANIES_READ")]
    public async Task<ActionResult<ApiResponse<List<CompanyDto>>>> GetAll([FromQuery] bool? isActive, [FromQuery] string? search)
    {
        var companies = await companyRepository.GetAllAsync(isActive, search);
        var dtos = companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            Name = c.Name,
            Gstin = c.Gstin,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        }).ToList();

        return Ok(ApiResponse<List<CompanyDto>>.Ok(dtos));
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
        return Ok(ApiResponse<string>.Ok("Company updated successfully"));
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
}
