using System;
using System.ComponentModel.DataAnnotations;

namespace PointOnSale.Application.DTOs.Wallet;

public class FundRequestDto
{
    public int Id { get; set; }
    public int FromScopeNodeId { get; set; }
    public string FromScopeName { get; set; }
    public int ToScopeNodeId { get; set; }
    public string ToScopeName { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; }
    public string Notes { get; set; }
    public string RejectionReason { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

public class CreateFundRequestDto
{
    [Required]
    public int ToScopeNodeId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    public string Notes { get; set; }
}

public class RejectFundRequestDto
{
    [Required]
    public string Reason { get; set; }
}
