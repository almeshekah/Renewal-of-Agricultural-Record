using Volo.Abp.Modularity;

namespace AgriculturalRecordRenewal;

public abstract class AgriculturalRecordRenewalApplicationTestBase<TStartupModule> : AgriculturalRecordRenewalTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
