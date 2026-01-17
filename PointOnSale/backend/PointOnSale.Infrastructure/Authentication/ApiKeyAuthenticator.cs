namespace PointOnSale.Infrastructure.Authentication;

public class ApiKeyAuthenticator
{
    private readonly string _configuredKey;

    public ApiKeyAuthenticator(string configuredKey)
    {
        _configuredKey = configuredKey;
    }

    public bool IsValid(string? apiKey)
    {
        return !string.IsNullOrWhiteSpace(apiKey) && apiKey == _configuredKey;
    }
}
