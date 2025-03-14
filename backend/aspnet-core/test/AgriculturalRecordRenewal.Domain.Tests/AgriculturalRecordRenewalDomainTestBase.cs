using Volo.Abp.Modularity;

namespace AgriculturalRecordRenewal;

/* Inherit from this class for your domain layer tests. */
public abstract class AgriculturalRecordRenewalDomainTestBase<TStartupModule> : AgriculturalRecordRenewalTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
