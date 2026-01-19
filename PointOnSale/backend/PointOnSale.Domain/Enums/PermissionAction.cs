namespace PointOnSale.Domain.Enums;

public enum PermissionAction
{
    Create,
    Read,
    Update,
    Delete,
    
    // Special Actions
    Activate,
    Assign,
    Approve,
    Fulfill,
    Reject,
    Adjust,
    Transfer,
    ConfirmPayment,
    Print,
    View,
    Manage,
    
    // System
    All
}
