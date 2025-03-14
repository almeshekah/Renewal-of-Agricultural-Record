using Volo.Abp.Modularity;

namespace AgriculturalRecordRenewal;

[DependsOn(
    typeof(AgriculturalRecordRenewalDomainModule),
    typeof(AgriculturalRecordRenewalTestBaseModule)
)]
public class AgriculturalRecordRenewalDomainTestModule : AbpModule
{

}
