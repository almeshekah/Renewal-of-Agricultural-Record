using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using AgriculturalRecordRenewal.Data;
using Volo.Abp.DependencyInjection;

namespace AgriculturalRecordRenewal.EntityFrameworkCore;

public class EntityFrameworkCoreAgriculturalRecordRenewalDbSchemaMigrator
    : IAgriculturalRecordRenewalDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreAgriculturalRecordRenewalDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the AgriculturalRecordRenewalDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<AgriculturalRecordRenewalDbContext>()
            .Database
            .MigrateAsync();
    }
}
