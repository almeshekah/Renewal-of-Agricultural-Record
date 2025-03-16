using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using AgriculturalRecordRenewal.Applications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;

namespace AgriculturalRecordRenewal.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class AgriculturalRecordRenewalDbContext :
    AbpDbContext<AgriculturalRecordRenewalDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */
    
    /// <summary>
    /// طلبات تجديد السجل الزراعي
    /// </summary>
    public DbSet<AgriculturalApplication> AgriculturalApplications { get; set; }
    
    /// <summary>
    /// مراجعات الطلبات
    /// </summary>
    public DbSet<ApplicationReview> ApplicationReviews { get; set; }

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }
    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    public AgriculturalRecordRenewalDbContext(DbContextOptions<AgriculturalRecordRenewalDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own tables/entities inside here */

        builder.Entity<AgriculturalApplication>(b =>
        {
            b.ToTable(AgriculturalRecordRenewalConsts.DbTablePrefix + "AgriculturalApplications", AgriculturalRecordRenewalConsts.DbSchema);
            b.ConfigureByConvention(); // تكوين تلقائي للخصائص الأساسية
            
            // تكوين إضافي للخصائص
            b.Property(e => e.ApplicationNumber).IsRequired().HasMaxLength(20);
            b.Property(e => e.Title).IsRequired().HasMaxLength(256);
            b.Property(e => e.ApplicantName).IsRequired().HasMaxLength(100);
            b.Property(e => e.Email).HasMaxLength(100);
            b.Property(e => e.MobileNumber).HasMaxLength(20);
            b.Property(e => e.Status).IsRequired();
            b.Property(e => e.FarmLocation).HasMaxLength(200);
            b.Property(e => e.Address).HasMaxLength(500);
            b.Property(e => e.RecordType).HasMaxLength(50);
            b.Property(e => e.AssignedToId).IsRequired(false);
            b.Property(e => e.AssignedTo).HasMaxLength(100).IsRequired(false);
            
            // تخزين تعليقات المراجعة كنص JSON
            b.Property(e => e.ReviewComments)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null)
                );

            b.ApplyObjectExtensionMappings();
        });

        // تكوين نموذج المراجعات
        builder.Entity<ApplicationReview>(b =>
        {
            b.ToTable(AgriculturalRecordRenewalConsts.DbTablePrefix + "ApplicationReviews", AgriculturalRecordRenewalConsts.DbSchema);
            b.ConfigureByConvention();
            
            b.HasKey(x => x.Id);
            b.Property(x => x.ApplicationId).IsRequired();
            b.Property(x => x.ReviewerId).HasMaxLength(36).IsRequired();
            b.Property(x => x.ReviewerName).HasMaxLength(100).IsRequired();
            b.Property(x => x.ReviewerRole).HasMaxLength(50).IsRequired();
            b.Property(x => x.ReviewDate).IsRequired();
            b.Property(x => x.Decision).HasMaxLength(20).IsRequired();
            b.Property(x => x.Comment).HasMaxLength(1000);
            
            b.HasIndex(x => x.ApplicationId);
            
            b.ApplyObjectExtensionMappings();
        });

        builder.TryConfigureObjectExtensions<AgriculturalRecordRenewalDbContext>();
    }
}
