using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Seeding;

public class DatabaseSeeder(PosDbContext dbContext)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (dbContext.Products.Any())
        {
            return;
        }

        dbContext.Products.AddRange(
            new Product { Name = "Espresso", DefaultSalePrice = 2.50m, SKU = "ESP001", HSN = "9901", IsActive = true },
            new Product { Name = "Cappuccino", DefaultSalePrice = 3.75m, SKU = "CAP001", HSN = "9901", IsActive = true }
        );

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
