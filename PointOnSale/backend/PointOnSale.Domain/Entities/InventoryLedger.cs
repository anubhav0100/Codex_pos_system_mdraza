using System;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class InventoryLedger
{
    public int Id { get; set; }
    
    public int ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }
    
    public int ProductId { get; set; }
    public Product Product { get; set; }
    
    public int QtyChange { get; set; }
    public StockTxnType TxnType { get; set; }
    public string RefType { get; set; }
    public string RefId { get; set; } // Could be int or string, user said RefId. Assuming string for flexibility or int? User: RefId without type. String is safer if mixed. But typically int. I'll use string to match RefType flexibility.
    
    public DateTime CreatedAt { get; set; }
}
