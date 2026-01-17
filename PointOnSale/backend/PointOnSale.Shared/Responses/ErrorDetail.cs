using System.Collections.Generic;

namespace PointOnSale.Shared.Responses;

public class ErrorDetail
{
    public string Code { get; set; }
    public string Detail { get; set; }
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    public ErrorDetail(string code, string detail, Dictionary<string, string[]>? validationErrors = null)
    {
        Code = code;
        Detail = detail;
        ValidationErrors = validationErrors;
    }
}
