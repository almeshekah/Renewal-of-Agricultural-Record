using Volo.Abp.Modularity;

namespace AgriculturalRecordRenewal;

[DependsOn(
    typeof(AgriculturalRecordRenewalApplicationModule),
    typeof(AgriculturalRecordRenewalDomainTestModule)
)]
public class AgriculturalRecordRenewalApplicationTestModule : AbpModule
{

}
