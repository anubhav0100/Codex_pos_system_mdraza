using Microsoft.EntityFrameworkCore;
using PointOnSale.Application.Interfaces;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;

namespace PointOnSale.Infrastructure.Repositories;

public class ProductRepository(PosDbContext dbContext) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task<List<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        dbContext.Products.Update(product);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Product product, CancellationToken cancellationToken = default)
    {
        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // Categories
    public async Task<List<ProductCategory>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.ProductCategories.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<ProductCategory?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProductCategories.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddCategoryAsync(ProductCategory category, CancellationToken cancellationToken = default)
    {
        dbContext.ProductCategories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateCategoryAsync(ProductCategory category, CancellationToken cancellationToken = default)
    {
        dbContext.ProductCategories.Update(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCategoryAsync(ProductCategory category, CancellationToken cancellationToken = default)
    {
        dbContext.ProductCategories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
