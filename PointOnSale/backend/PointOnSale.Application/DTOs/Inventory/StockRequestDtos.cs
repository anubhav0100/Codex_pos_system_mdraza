using System.ComponentModel.DataAnnotations;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.DTOs.Inventory;

public class StockRequestDto
{
    public int Id { get; set; }
    public int FromScopeNodeId { get; set; }
    public string FromScopeName { get; set; }
    
    public int ToScopeNodeId { get; set; }
    public string ToScopeName { get; set; }
    
    public string Status { get; set; } // Enum string
    public DateTime RequestedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? FulfilledAt { get; set; }
    
    public List<StockRequestItemDto> Items { get; set; }
    
    public int? CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; }
}

public class StockRequestItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int Qty { get; set; }
}

public class CreateStockRequestDto
{
    public int FromScopeNodeId { get; set; }
    
    [Required]
    public int ToScopeNodeId { get; set; }
    
    [Required]
    [MinLength(1)]
    public List<CreateStockRequestItemDto> Items { get; set; }
}

public class CreateStockRequestItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Range(1, int.MaxValue)]
    public int Qty { get; set; }
}

public class RequestActionDto
{
    public string Comments { get; set; } // Optional comments for log/history (if implemented)
}
