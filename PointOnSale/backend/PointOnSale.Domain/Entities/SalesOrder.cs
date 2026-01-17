using System;
using System.Collections.Generic;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Domain.Entities;

public class SalesOrder
{
    public int Id { get; set; }
    
    public SalesStatus Status { get; set; }
    
    public int ScopeNodeId { get; set; }
    public ScopeNode ScopeNode { get; set; }
    
    public decimal Total { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }
    
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentRef { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public ICollection<SalesOrderItem> Items { get; set; }
}
