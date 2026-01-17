using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Persistence;

namespace PointOnSale.Infrastructure.Seeding;

public class DatabaseSeeder(PointOnSaleDbContext dbContext)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (dbContext.Products.Any())
        {
            return;
        }

        dbContext.Products.AddRange(
            new Product { Id = Guid.NewGuid(), Name = "Espresso", Price = 2.50m },
            new Product { Id = Guid.NewGuid(), Name = "Cappuccino", Price = 3.75m }
        );

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
