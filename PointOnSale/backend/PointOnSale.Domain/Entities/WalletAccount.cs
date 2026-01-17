using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class WalletAccount
{
    public int Id { get; set; }
    
    public int ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }
    
    public WalletType WalletType { get; set; }
    public decimal Balance { get; set; }
}
