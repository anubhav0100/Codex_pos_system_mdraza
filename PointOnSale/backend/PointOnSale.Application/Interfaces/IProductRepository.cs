using PointOnSale.Domain.Entities;

namespace PointOnSale.Application.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<List<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(Product product, CancellationToken cancellationToken = default);

    // Assignments
    Task<ProductAssignment?> GetAssignmentAsync(int scopeNodeId, int productId, CancellationToken cancellationToken = default);
    Task<List<ProductAssignment>> GetAssignmentsByScopeAsync(int scopeNodeId, CancellationToken cancellationToken = default);
    Task AddAssignmentAsync(ProductAssignment assignment, CancellationToken cancellationToken = default);
    Task UpdateAssignmentAsync(ProductAssignment assignment, CancellationToken cancellationToken = default);
    Task DeleteAssignmentAsync(ProductAssignment assignment, CancellationToken cancellationToken = default);

    // Categories
    Task<List<ProductCategory>> GetAllCategoriesAsync(CancellationToken cancellationToken = default);
    Task<ProductCategory?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddCategoryAsync(ProductCategory category, CancellationToken cancellationToken = default);
    Task UpdateCategoryAsync(ProductCategory category, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(ProductCategory category, CancellationToken cancellationToken = default);
}
