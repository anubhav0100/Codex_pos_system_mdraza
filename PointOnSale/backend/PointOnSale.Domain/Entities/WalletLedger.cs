using System;

namespace PointOnSale.Domain.Entities;

public class WalletLedger
{
    public int Id { get; set; }
    
    public int? FromWalletId { get; set; }
    public WalletAccount FromWallet { get; set; }
    
    public int? ToWalletId { get; set; }
    public WalletAccount ToWallet { get; set; }
    
    public decimal Amount { get; set; }
    public string RefType { get; set; }
    public string RefId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Notes { get; set; }
}
