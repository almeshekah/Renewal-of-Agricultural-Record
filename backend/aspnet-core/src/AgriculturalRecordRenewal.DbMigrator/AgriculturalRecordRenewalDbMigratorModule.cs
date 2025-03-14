using AgriculturalRecordRenewal.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace AgriculturalRecordRenewal.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(AgriculturalRecordRenewalEntityFrameworkCoreModule),
    typeof(AgriculturalRecordRenewalApplicationContractsModule)
    )]
public class AgriculturalRecordRenewalDbMigratorModule : AbpModule
{
}
