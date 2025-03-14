using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace AgriculturalRecordRenewal.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class AgriculturalRecordRenewalDbContextFactory : IDesignTimeDbContextFactory<AgriculturalRecordRenewalDbContext>
{
    public AgriculturalRecordRenewalDbContext CreateDbContext(string[] args)
    {
        // Fix DateTime UTC conversion issues with PostgreSQL
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        
        AgriculturalRecordRenewalEfCoreEntityExtensionMappings.Configure();

        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<AgriculturalRecordRenewalDbContext>()
            .UseNpgsql(configuration.GetConnectionString("Default"));

        return new AgriculturalRecordRenewalDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../AgriculturalRecordRenewal.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
