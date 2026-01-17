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

    // Assignments
    public async Task<ProductAssignment?> GetAssignmentAsync(int scopeNodeId, int productId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProductAssignments
            .Include(pa => pa.Product)
            .FirstOrDefaultAsync(pa => pa.ScopeNodeId == scopeNodeId && pa.ProductId == productId, cancellationToken);
    }

    public async Task<List<ProductAssignment>> GetAssignmentsByScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProductAssignments
            .AsNoTracking()
            .Include(pa => pa.Product)
            .Where(pa => pa.ScopeNodeId == scopeNodeId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAssignmentAsync(ProductAssignment assignment, CancellationToken cancellationToken = default)
    {
        dbContext.ProductAssignments.Add(assignment);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAssignmentAsync(ProductAssignment assignment, CancellationToken cancellationToken = default)
    {
        dbContext.ProductAssignments.Update(assignment);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAssignmentAsync(ProductAssignment assignment, CancellationToken cancellationToken = default)
    {
        dbContext.ProductAssignments.Remove(assignment);
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
