using AgriculturalRecordRenewal.Samples;
using Xunit;

namespace AgriculturalRecordRenewal.EntityFrameworkCore.Domains;

[Collection(AgriculturalRecordRenewalTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<AgriculturalRecordRenewalEntityFrameworkCoreTestModule>
{

}
