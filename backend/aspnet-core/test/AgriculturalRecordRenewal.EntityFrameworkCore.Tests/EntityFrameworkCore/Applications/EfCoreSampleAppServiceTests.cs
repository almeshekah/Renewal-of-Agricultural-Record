using AgriculturalRecordRenewal.Samples;
using Xunit;

namespace AgriculturalRecordRenewal.EntityFrameworkCore.Applications;

[Collection(AgriculturalRecordRenewalTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<AgriculturalRecordRenewalEntityFrameworkCoreTestModule>
{

}
