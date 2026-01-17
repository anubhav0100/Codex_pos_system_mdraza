using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PointOnSale.Domain.Entities;
using PointOnSale.Infrastructure.Data;
using PointOnSale.Infrastructure.Seeding;
using Xunit;

namespace PointOnSale.Tests;

public class RbacSeederTests
{
    private readonly PosDbContext _dbContext;
    private readonly RbacSeeder _seeder;

    public RbacSeederTests()
    {
        var options = new DbContextOptionsBuilder<PosDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new PosDbContext(options);
        var mockLogger = new Mock<ILogger<RbacSeeder>>();
        _seeder = new RbacSeeder(_dbContext, mockLogger.Object);
    }

    [Fact]
    public async Task SeedAsync_ShouldBeIdempotent()
    {
        // Act 1: Initial Seed
        var result1 = await _seeder.SeedAsync();
        
        Assert.NotEmpty(result1);
        Assert.NotEqual(0, await _dbContext.Roles.CountAsync());
        Assert.NotEqual(0, await _dbContext.Permissions.CountAsync());
        Assert.NotEqual(0, await _dbContext.RolePermissions.CountAsync());

        var roleCount = await _dbContext.Roles.CountAsync();
        var permCount = await _dbContext.Permissions.CountAsync();

        // Act 2: Second Seed (No changes expected)
        var result2 = await _seeder.SeedAsync();
        
        Assert.Empty(result2.Trim());
        Assert.Equal(roleCount, await _dbContext.Roles.CountAsync());
        Assert.Equal(permCount, await _dbContext.Permissions.CountAsync());
    }

    [Fact]
    public async Task SeedAsync_ShouldAddNewPermissions()
    {
        // Arrange: Seed once
        await _seeder.SeedAsync();
        var initialPermCount = await _dbContext.Permissions.CountAsync();

        // Manually delete a permission to simulate "missing" permission
        var perm = await _dbContext.Permissions.FirstAsync();
        _dbContext.Permissions.Remove(perm);
        await _dbContext.SaveChangesAsync();

        // Act: Seed again
        var result = await _seeder.SeedAsync();

        // Assert: It should be re-added
        Assert.Contains($"Added Permission: {perm.Code}", result);
        Assert.Equal(initialPermCount, await _dbContext.Permissions.CountAsync());
    }
}
