using System;
using Microsoft.Extensions.DependencyInjection;
using Localization.Resources.AbpUi;
using AgriculturalRecordRenewal.Localization;
using Volo.Abp.Account;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement.HttpApi;
using Volo.Abp.SettingManagement;
using Volo.Abp.TenantManagement;
using AgriculturalRecordRenewal.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AgriculturalRecordRenewal;

[DependsOn(
    typeof(AgriculturalRecordRenewalApplicationContractsModule),
    typeof(AbpAccountHttpApiModule),
    typeof(AbpIdentityHttpApiModule),
    typeof(AbpPermissionManagementHttpApiModule),
    typeof(AbpTenantManagementHttpApiModule),
    typeof(AbpFeatureManagementHttpApiModule),
    typeof(AbpSettingManagementHttpApiModule)
    )]
public class AgriculturalRecordRenewalHttpApiModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        ConfigureLocalization();
        
        // Explicitly register the auth controller
        context.Services.AddTransient<AuthController>();
        
        // Add MVC controllers
        context.Services.AddControllers()
            .AddApplicationPart(typeof(AgriculturalRecordRenewalHttpApiModule).Assembly);
    }

    private void ConfigureLocalization()
    {
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<AgriculturalRecordRenewalResource>()
                .AddBaseTypes(
                    typeof(AbpUiResource)
                );
        });
    }
}
