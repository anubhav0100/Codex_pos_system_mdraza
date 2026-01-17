using System.ComponentModel.DataAnnotations;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.DTOs.Inventory;

public class InventoryBalanceDto
{
    public int ScopeNodeId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string ProductSKU { get; set; }
    public int QtyOnHand { get; set; }
}

public class InventoryLedgerDto
{
    public int Id { get; set; }
    public int ScopeNodeId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int QtyChange { get; set; }
    public string TxnType { get; set; } // Enum as string
    public string RefType { get; set; }
    public string RefId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdjustInventoryDto
{
    [Required]
    public int ScopeNodeId { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    public int QtyChange { get; set; } // Can be negative
    
    [MaxLength(200)]
    public string Notes { get; set; }
}
