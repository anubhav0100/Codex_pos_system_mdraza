using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PointOnSale.Application.Interfaces;
using PointOnSale.Infrastructure.Authentication;
using PointOnSale.Infrastructure.Persistence;
using PointOnSale.Infrastructure.Repositories;
using PointOnSale.Infrastructure.Seeding;

namespace PointOnSale.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PointOnSaleDbContext>(options =>
        {
            options.UseInMemoryDatabase("PointOnSaleDb");
        });

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<DatabaseSeeder>();

        var apiKey = configuration["Auth:ApiKey"] ?? "dev-key";
        services.AddSingleton(new ApiKeyAuthenticator(apiKey));

        return services;
    }
}
