using System.ComponentModel.DataAnnotations;
using PointOnSale.Application.DTOs.Pricing;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Application.DTOs.Pos;

public class CreateSaleItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Qty { get; set; }
}

public class CreateSaleDto
{
    [Required]
    public int ScopeNodeId { get; set; }
    
    [Required]
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

public class ConfirmPaymentDto
{
    [Required]
    public PaymentMethod PaymentMethod { get; set; }
    
    public string PaymentRef { get; set; }
}

public class SalesOrderDto
{
    public int Id { get; set; }
    public string Status { get; set; }
    public int ScopeNodeId { get; set; }
    public decimal Total { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; }
    public string PaymentRef { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<SalesOrderItemDto> Items { get; set; } = new();
}

public class SalesOrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal LineTotal { get; set; }
}
