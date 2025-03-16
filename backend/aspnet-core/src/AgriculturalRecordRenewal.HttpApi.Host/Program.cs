using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;

namespace AgriculturalRecordRenewal;

public class Program
{
    public async static Task<int> Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
#if DEBUG
            .MinimumLevel.Debug()
#else
            .MinimumLevel.Information()
#endif
            .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .WriteTo.Async(c => c.File("Logs/logs.txt"))
            .WriteTo.Async(c => c.Console(theme: AnsiConsoleTheme.Code))
            .CreateLogger();

        try
        {
            Log.Information("Starting AgriculturalRecordRenewal.HttpApi.Host.");
            
            // Explicitly set the environment if it's not specified
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")))
            {
                Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
            }
            
            var builder = WebApplication.CreateBuilder(args);
            builder.Host.AddAppSettingsSecretsJson()
                .UseAutofac()
                .UseSerilog();
            
            // Log startup details
            Log.Information("Environment: {Environment}", builder.Environment.EnvironmentName);
            Log.Information("Content Root Path: {ContentRootPath}", builder.Environment.ContentRootPath);
            Log.Information("Web Root Path: {WebRootPath}", builder.Environment.WebRootPath);
            
            await builder.AddApplicationAsync<AgriculturalRecordRenewalHttpApiHostModule>();
            var app = builder.Build();
            await app.InitializeApplicationAsync();
            
            // Log URLs the application is listening on
            var urls = app.Urls;
            foreach (var url in urls)
            {
                Log.Information("Listening on URL: {Url}", url);
            }
            
            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            if (ex.GetType().Name.Equals("StopTheHostException", StringComparison.Ordinal))
            {
                throw;
            }

            Log.Fatal(ex, "Host terminated unexpectedly!");
            return 1;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
