using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PointOnSale.Application.Interfaces;
using PointOnSale.Infrastructure.Authentication;

using PointOnSale.Infrastructure.Repositories;
using PointOnSale.Infrastructure.Seeding;

namespace PointOnSale.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PointOnSale.Infrastructure.Data.PosDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(PointOnSale.Infrastructure.Data.PosDbContext).Assembly.FullName)));

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<PointOnSale.Infrastructure.Data.DbInitializer>();
        services.AddScoped<DatabaseSeeder>();

        var apiKey = configuration["Auth:ApiKey"] ?? "dev-key";
        services.AddSingleton(new ApiKeyAuthenticator(apiKey));

        return services;
    }
}
