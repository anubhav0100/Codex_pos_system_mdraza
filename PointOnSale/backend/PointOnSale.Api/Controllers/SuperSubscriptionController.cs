using Microsoft.AspNetCore.Mvc;
using PointOnSale.Api.Auth;
using PointOnSale.Application.DTOs.Subscriptions;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Shared.Responses;

namespace PointOnSale.Api.Controllers;

[ApiController]
[Route("v1/super")]
[RequirePermission("SUPER_ADMIN")]
public class SuperSubscriptionController(ISubscriptionRepository subscriptionRepository, ICompanyRepository companyRepository) : ControllerBase
{
    [HttpGet("subscription-plans")]
    [RequirePermission("SUBSCRIPTIONS_READ")]
    public async Task<ActionResult<ApiResponse<List<SubscriptionPlanDto>>>> GetPlans()
    {
        var plans = await subscriptionRepository.GetAllPlansAsync();
        var dtos = plans.Select(p => new SubscriptionPlanDto
        {
            Id = p.Id,
            Name = p.Name,
            MonthlyPrice = p.MonthlyPrice,
            LimitsJson = p.LimitsJson,
            IsActive = p.IsActive
        }).ToList();

        return Ok(ApiResponse<List<SubscriptionPlanDto>>.Ok(dtos));
    }

    [HttpPost("subscription-plans")]
    [RequirePermission("SUBSCRIPTIONS_CREATE")]
    public async Task<ActionResult<ApiResponse<SubscriptionPlanDto>>> CreatePlan([FromBody] CreateSubscriptionPlanDto dto)
    {
        var plan = new SubscriptionPlan
        {
            Name = dto.Name,
            MonthlyPrice = dto.MonthlyPrice,
            LimitsJson = dto.LimitsJson,
            IsActive = true
        };

        await subscriptionRepository.AddPlanAsync(plan);

        return Ok(ApiResponse<SubscriptionPlanDto>.Ok(new SubscriptionPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            MonthlyPrice = plan.MonthlyPrice,
            LimitsJson = plan.LimitsJson,
            IsActive = plan.IsActive
        }, "Plan created successfully"));
    }

    [HttpPost("companies/{companyId}/subscription")]
    [RequirePermission("SUBSCRIPTIONS_UPDATE")] 
    public async Task<ActionResult<ApiResponse<string>>> AssignSubscription(int companyId, [FromBody] AssignSubscriptionDto dto)
    {
        var company = await companyRepository.GetByIdAsync(companyId);
        if (company == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Company not found"), "Company not found"));

        var plan = await subscriptionRepository.GetPlanByIdAsync(dto.PlanId);
        if (plan == null) return NotFound(ApiResponse<string>.Fail(new ErrorDetail("404", "Plan not found"), "Plan not found"));

        var subscription = new CompanySubscription
        {
            CompanyId = companyId,
            PlanId = dto.PlanId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true
        };

        await subscriptionRepository.AddCompanySubscriptionAsync(subscription);

        return Ok(ApiResponse<string>.Ok("Subscription assigned successfully"));
    }
}
