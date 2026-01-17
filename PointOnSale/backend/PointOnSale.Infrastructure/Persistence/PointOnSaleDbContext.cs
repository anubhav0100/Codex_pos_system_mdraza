using Microsoft.EntityFrameworkCore;
using PointOnSale.Domain.Entities;

namespace PointOnSale.Infrastructure.Persistence;

public class PointOnSaleDbContext(DbContextOptions<PointOnSaleDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}
