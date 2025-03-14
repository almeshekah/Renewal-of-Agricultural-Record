using Microsoft.Extensions.Localization;
using AgriculturalRecordRenewal.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace AgriculturalRecordRenewal;

[Dependency(ReplaceServices = true)]
public class AgriculturalRecordRenewalBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<AgriculturalRecordRenewalResource> _localizer;

    public AgriculturalRecordRenewalBrandingProvider(IStringLocalizer<AgriculturalRecordRenewalResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
