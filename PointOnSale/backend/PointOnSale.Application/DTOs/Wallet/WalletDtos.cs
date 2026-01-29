using System.ComponentModel.DataAnnotations;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.DTOs.Wallet;

public class WalletDto
{
    public int Id { get; set; }
    public int ScopeNodeId { get; set; }
    public string WalletType { get; set; }
    public decimal Balance { get; set; }
}

public class WalletLedgerDto
{
    public int Id { get; set; }
    public int? FromWalletId { get; set; }
    public int? ToWalletId { get; set; }
    public decimal Amount { get; set; }
    public string RefType { get; set; }
    public string RefId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Notes { get; set; }
    public decimal AdminCharges { get; set; }
    public decimal TDS { get; set; }
    public decimal Commission { get; set; }
}

public class WalletTransferDto
{
    [Required]
    public int FromScopeNodeId { get; set; }
    
    [Required]
    public WalletType FromWalletType { get; set; }
    
    [Required]
    public int ToScopeNodeId { get; set; }
    
    [Required]
    public WalletType ToWalletType { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    
    public string Notes { get; set; }
}
