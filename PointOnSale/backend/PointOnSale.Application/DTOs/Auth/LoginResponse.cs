namespace PointOnSale.Application.DTOs.Auth;

public class LoginResponse
{
    public string AccessToken { get; set; }
    public UserProfileDto UserProfile { get; set; }

    public LoginResponse(string accessToken, UserProfileDto userProfile)
    {
        AccessToken = accessToken;
        UserProfile = userProfile;
    }
}
