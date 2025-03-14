using AgriculturalRecordRenewal.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace AgriculturalRecordRenewal.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class AgriculturalRecordRenewalController : AbpControllerBase
{
    protected AgriculturalRecordRenewalController()
    {
        LocalizationResource = typeof(AgriculturalRecordRenewalResource);
    }
}
