using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AgriculturalRecordRenewal.EntityFrameworkCore;
using AgriculturalRecordRenewal.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;
using Microsoft.OpenApi.Models;
using OpenIddict.Validation.AspNetCore;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Account.Web;
using Volo.Abp.AspNetCore.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Shared;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Autofac;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.Security.Claims;
using Volo.Abp.Swashbuckle;
using Volo.Abp.UI.Navigation.Urls;
using Volo.Abp.VirtualFileSystem;
using Microsoft.Extensions.Logging;
using OpenIddict.Server;
using Volo.Abp.Auditing;
using Volo.Abp.BackgroundJobs;

namespace AgriculturalRecordRenewal;

[DependsOn(
    typeof(AgriculturalRecordRenewalHttpApiModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMultiTenancyModule),
    typeof(AgriculturalRecordRenewalApplicationModule),
    typeof(AgriculturalRecordRenewalEntityFrameworkCoreModule),
    typeof(AbpAspNetCoreMvcUiLeptonXLiteThemeModule),
    typeof(AbpAccountWebOpenIddictModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule)
)]
public class AgriculturalRecordRenewalHttpApiHostModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        var configuration = context.Services.GetConfiguration();

        PreConfigure<OpenIddictBuilder>(builder =>
        {
            builder.AddValidation(options =>
            {
                options.AddAudiences("AgriculturalRecordRenewal");
                options.UseLocalServer();
                options.UseAspNetCore();
            });
        });

        // Configure OpenIddict server for development
        if (hostingEnvironment.IsDevelopment())
        {
            // Disable HTTPS requirement for development in the server options
            PreConfigure<OpenIddictServerBuilder>(builder =>
            {
                builder.UseAspNetCore(options =>
                {
                    options.DisableTransportSecurityRequirement();
                });
            });
        }
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        // تعطيل سجلات التدقيق لمنع مشاكل قفل قاعدة البيانات
        Configure<AbpAuditingOptions>(options =>
        {
            options.IsEnabled = false; // تعطيل سجلات التدقيق في بيئة التطوير
        });

        // تعطيل وظائف أعمال الخلفية لمنع أخطاء قاعدة البيانات
        Configure<AbpBackgroundJobOptions>(options =>
        {
            options.IsJobExecutionEnabled = false; // تعطيل تنفيذ أعمال الخلفية
        });

        ConfigureAuthentication(context);
        ConfigureBundles();
        ConfigureUrls(configuration);
        ConfigureConventionalControllers();
        ConfigureVirtualFileSystem(context);
        ConfigureCors(context, configuration);
        ConfigureSwaggerServices(context, configuration);
    }

    private void ConfigureAuthentication(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        
        // Existing OpenID Connect Authentication
        context.Services.ForwardIdentityAuthenticationForBearer(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
        
        // Add JWT Authentication Support
        context.Services.AddAuthentication()
            .AddJwtBearer("JWT", options =>
            {
                options.Authority = null;
                options.RequireHttpsMetadata = false;
                
                // Disable audience validation for development
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"] ?? "agricultural-record-renewal",
                    ValidAudience = configuration["Jwt:Audience"] ?? "agricultural-record-renewal-app",
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                        System.Text.Encoding.UTF8.GetBytes(
                            configuration["Jwt:Key"] ?? "YOUR_SECRET_KEY_HERE_MINIMUM_16_CHARACTERS_LONG_12345"
                        )
                    ),
                    // For development, add some leeway to avoid clock skew issues
                    ClockSkew = TimeSpan.FromMinutes(5)
                };
                
                // Event handling
                options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<AgriculturalRecordRenewalHttpApiHostModule>>();
                        logger.LogDebug("JWT OnMessageReceived: {Path}", context.HttpContext.Request.Path);
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<AgriculturalRecordRenewalHttpApiHostModule>>();
                        logger.LogWarning("JWT Authentication failed: {Exception}", context.Exception.Message);
                        return Task.CompletedTask;
                    }
                };
            });

        // Set JWT as an additional default scheme
        context.Services.Configure<AuthenticationOptions>(options =>
        {
            options.DefaultScheme = "JWT";
            options.DefaultChallengeScheme = "JWT";
        });
        
        context.Services.Configure<AbpClaimsPrincipalFactoryOptions>(options =>
        {
            options.IsDynamicClaimsEnabled = true;
        });
    }

    private void ConfigureBundles()
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                LeptonXLiteThemeBundles.Styles.Global,
                bundle =>
                {
                    bundle.AddFiles("/global-styles.css");
                }
            );
        });
    }

    private void ConfigureUrls(IConfiguration configuration)
    {
        Configure<AppUrlOptions>(options =>
        {
            options.Applications["MVC"].RootUrl = configuration["App:SelfUrl"];
            options.RedirectAllowedUrls.AddRange(configuration["App:RedirectAllowedUrls"]?.Split(',') ?? Array.Empty<string>());

            options.Applications["Angular"].RootUrl = configuration["App:ClientUrl"];
            options.Applications["Angular"].Urls[AccountUrlNames.PasswordReset] = "account/reset-password";
        });
    }

    private void ConfigureVirtualFileSystem(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        if (hostingEnvironment.IsDevelopment())
        {
            Configure<AbpVirtualFileSystemOptions>(options =>
            {
                options.FileSets.ReplaceEmbeddedByPhysical<AgriculturalRecordRenewalDomainSharedModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}AgriculturalRecordRenewal.Domain.Shared"));
                options.FileSets.ReplaceEmbeddedByPhysical<AgriculturalRecordRenewalDomainModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}AgriculturalRecordRenewal.Domain"));
                options.FileSets.ReplaceEmbeddedByPhysical<AgriculturalRecordRenewalApplicationContractsModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}AgriculturalRecordRenewal.Application.Contracts"));
                options.FileSets.ReplaceEmbeddedByPhysical<AgriculturalRecordRenewalApplicationModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}AgriculturalRecordRenewal.Application"));
            });
        }
    }

    private void ConfigureConventionalControllers()
    {
        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(AgriculturalRecordRenewalApplicationModule).Assembly);
            options.ConventionalControllers.Create(typeof(AgriculturalRecordRenewalHttpApiModule).Assembly);
        });
    }

    private static void ConfigureSwaggerServices(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddAbpSwaggerGenWithOAuth(
            configuration["AuthServer:Authority"]!,
            new Dictionary<string, string>
            {
                    {"AgriculturalRecordRenewal", "AgriculturalRecordRenewal API"}
            },
            options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "AgriculturalRecordRenewal API", Version = "v1" });
                options.DocInclusionPredicate((docName, description) => true);
                options.CustomSchemaIds(type => type.FullName);
            });
    }

    private void ConfigureCors(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins(configuration["App:CorsOrigins"]?
                        .Split(",", StringSplitOptions.RemoveEmptyEntries)
                        .Select(o => o.RemovePostFix("/"))
                        .ToArray() ?? Array.Empty<string>())
                    .WithAbpExposedHeaders()
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();

        if (!env.IsDevelopment())
        {
            app.UseErrorPage();
        }

        app.UseCorrelationId();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors();

        // Debug middleware to log all incoming requests
        app.Use(async (context, next) =>
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<AgriculturalRecordRenewalHttpApiHostModule>>();
            logger.LogInformation($"Incoming request: {context.Request.Method} {context.Request.Path}");
            
            await next();
            
            logger.LogInformation($"Response status code: {context.Response.StatusCode}");
        });
        
        app.UseAuthentication();
        app.UseAbpOpenIddictValidation();
        
        // Configure JWT auth scheme for API routes
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                // Set header for API routes to use JWT auth
                context.Request.Headers["X-Authentication-Scheme"] = "JWT";
            }
            
            await next();
        });

        if (MultiTenancyConsts.IsEnabled)
        {
            app.UseMultiTenancy();
        }

        app.UseUnitOfWork();
        app.UseAuthorization();
        app.UseAuditing();
        app.UseAbpSerilogEnrichers();

        app.UseEndpoints(endpoints =>
        {
            // Add standard MVC controller route
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
                
            // Add explicit mapping for the auth controller
            endpoints.MapControllerRoute(
                name: "auth",
                pattern: "api/auth/{action}",
                defaults: new { controller = "Auth" });
                
            // Map all API controllers
            endpoints.MapControllers();
        });

        app.UseSwagger();
        app.UseAbpSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "AgriculturalRecordRenewal API");
            var configuration = context.ServiceProvider.GetRequiredService<IConfiguration>();
            c.OAuthClientId(configuration["AuthServer:SwaggerClientId"]);
            c.OAuthScopes("AgriculturalRecordRenewal");
        });
    }
}
