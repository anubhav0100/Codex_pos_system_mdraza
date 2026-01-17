using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace PointOnSale.Infrastructure.Data;

public class DbInitializer
{
    private readonly ILogger<DbInitializer> _logger;
    private readonly IServiceProvider _serviceProvider;

    public DbInitializer(ILogger<DbInitializer> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task InitializeAsync()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PosDbContext>();

            if (context.Database.IsSqlServer())
            {
                await context.Database.MigrateAsync();
            }

            var rbacSeeder = scope.ServiceProvider.GetRequiredService<PointOnSale.Infrastructure.Seeding.RbacSeeder>();
            await rbacSeeder.SeedAsync();

            var initialDataSeeder = scope.ServiceProvider.GetRequiredService<PointOnSale.Infrastructure.Seeding.InitialDataSeeder>();
            await initialDataSeeder.SeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }
}
