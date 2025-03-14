using System;
using System.Collections.Generic;
using System.Text;
using AgriculturalRecordRenewal.Localization;
using Volo.Abp.Application.Services;

namespace AgriculturalRecordRenewal;

/* Inherit your application services from this class.
 */
public abstract class AgriculturalRecordRenewalAppService : ApplicationService
{
    protected AgriculturalRecordRenewalAppService()
    {
        LocalizationResource = typeof(AgriculturalRecordRenewalResource);
    }
}
