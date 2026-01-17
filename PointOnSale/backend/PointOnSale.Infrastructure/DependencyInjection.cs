using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PointOnSale.Application.Interfaces;


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
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IApiKeyRepository, ApiKeyRepository>();
        services.AddScoped<IScopeRepository, ScopeRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IPermissionService, Services.PermissionService>();
        services.AddScoped<PointOnSale.Infrastructure.Data.DbInitializer>();
        services.AddScoped<DatabaseSeeder>();
        services.AddScoped<PointOnSale.Infrastructure.Seeding.RbacSeeder>();
        services.AddScoped<PointOnSale.Infrastructure.Seeding.InitialDataSeeder>();



        return services;
    }
}
