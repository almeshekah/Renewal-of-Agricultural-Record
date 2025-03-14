using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace AgriculturalRecordRenewal.Data;

/* This is used if database provider does't define
 * IAgriculturalRecordRenewalDbSchemaMigrator implementation.
 */
public class NullAgriculturalRecordRenewalDbSchemaMigrator : IAgriculturalRecordRenewalDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
