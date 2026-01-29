using Microsoft.EntityFrameworkCore;
using PointOnSale.Domain.Entities;
using PointOnSale.Domain.Enums;

namespace PointOnSale.Infrastructure.Data;

public class PosDbContext : DbContext
{
    public PosDbContext(DbContextOptions<PosDbContext> options) : base(options)
    {
    }

    // Platform & Hierarchy
    public DbSet<Company> Companies { get; set; }
    public DbSet<ScopeNode> ScopeNodes { get; set; }
    public DbSet<LocationCountry> LocationCountries { get; set; }
    public DbSet<LocationState> LocationStates { get; set; }
    public DbSet<LocationDistrict> LocationDistricts { get; set; }
    public DbSet<LocationLocal> LocationLocals { get; set; }

    // RBAC & Auth
    public DbSet<AppUser> AppUsers { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<ApiKey> ApiKeys { get; set; }

    // Products
    public DbSet<ProductCategory> ProductCategories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductAssignment> ProductAssignments { get; set; }

    // Inventory
    public DbSet<InventoryLedger> InventoryLedgers { get; set; }
    public DbSet<StockBalance> StockBalances { get; set; }

    // Requests
    public DbSet<StockRequest> StockRequests { get; set; }
    public DbSet<StockRequestItem> StockRequestItems { get; set; }

    // Wallet
    public DbSet<WalletAccount> WalletAccounts { get; set; }
    public DbSet<WalletLedger> WalletLedgers { get; set; }
    public DbSet<FundRequest> FundRequests { get; set; }

    // POS + Invoice
    public DbSet<SalesOrder> SalesOrders { get; set; }
    public DbSet<SalesOrderItem> SalesOrderItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceLine> InvoiceLines { get; set; }
    public DbSet<InvoiceSequence> InvoiceSequences { get; set; }

    // Subscription
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<CompanySubscription> CompanySubscriptions { get; set; }

    // Audit
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Unique Indexes ---
        modelBuilder.Entity<AppUser>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Role>().HasIndex(r => r.Code).IsUnique();
        modelBuilder.Entity<Permission>().HasIndex(p => p.Code).IsUnique();
        modelBuilder.Entity<Product>().HasIndex(p => p.SKU).IsUnique();

        // --- Composite Keys and Uniqueness ---
        
        // StockBalance(ScopeNodeId, ProductId)
        modelBuilder.Entity<StockBalance>().HasKey(sb => new { sb.ScopeNodeId, sb.ProductId });

        // ProductAssignment(ScopeNodeId, ProductId)
        modelBuilder.Entity<ProductAssignment>().HasKey(pa => new { pa.ScopeNodeId, pa.ProductId });

        // UserRole
        modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });

        // RolePermission
        modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });

        // StockRequestItem
        modelBuilder.Entity<StockRequestItem>().HasKey(sri => new { sri.StockRequestId, sri.ProductId });

        // SalesOrderItem
        modelBuilder.Entity<SalesOrderItem>().HasKey(soi => new { soi.SalesOrderId, soi.ProductId });

        // InvoiceLine
        modelBuilder.Entity<InvoiceLine>().HasKey(il => new { il.InvoiceId, il.ProductId });

        // InvoiceSequence Unique(Company, FY)
        modelBuilder.Entity<InvoiceSequence>().HasIndex(isq => new { isq.CompanyId, isq.FiscalYear }).IsUnique();

        // CompanySubscription
        modelBuilder.Entity<CompanySubscription>().HasKey(cs => new { cs.CompanyId, cs.PlanId });

        // --- Relationships ---

        // ScopeNode Parent-Child
        modelBuilder.Entity<ScopeNode>()
            .HasOne(s => s.ParentScopeNode)
            .WithMany() // No collection on parent for children needed explicitly unless requested
            .HasForeignKey(s => s.ParentScopeNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // ScopeNode -> Company
        modelBuilder.Entity<ScopeNode>()
            .HasOne(s => s.Company)
            .WithMany()
            .HasForeignKey(s => s.CompanyId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting company deletes scopes? Maybe Restrict is safer but Cascade implies full cleanup.

        // AppUser -> ScopeNode
        modelBuilder.Entity<AppUser>()
            .HasOne(u => u.ScopeNode)
            .WithMany()
            .HasForeignKey(u => u.ScopeNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // --- Global Query Filters (IsActive) ---
        
        // Apply to all entities that have IsActive property
        modelBuilder.Entity<Company>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<ScopeNode>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<AppUser>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<SubscriptionPlan>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<CompanySubscription>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<ApiKey>().HasQueryFilter(e => e.IsActive);

        // --- Precision Configuration (Optional but good for decimals) ---
        var decimalProps = modelBuilder.Model
            .GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?));

        foreach (var property in decimalProps)
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }
    }
}
