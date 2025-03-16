using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using AgriculturalRecordRenewal.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Volo.Abp.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Volo.Abp.Data;

namespace UserCreator
{
    [DependsOn(
        typeof(AgriculturalRecordRenewalEntityFrameworkCoreModule)
    )]
    public class UserCreatorModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .Build();

            context.Services.AddAbpDbContext<AgriculturalRecordRenewalDbContext>(options =>
            {
                options.AddDefaultRepositories(includeAllEntities: true);
            });

            Configure<AbpDbContextOptions>(options =>
            {
                options.UseSqlite();
            });
        }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            using var application = await AbpApplicationFactory.CreateAsync<UserCreatorModule>();
            await application.InitializeAsync();

            try
            {
                Console.WriteLine("Starting to create users...");
                await CreateUsersAsync(application.ServiceProvider);
                Console.WriteLine("Users created successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
            finally
            {
                await application.ShutdownAsync();
            }

            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }

        private static async Task CreateUsersAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<IdentityUserManager>();
            var roleManager = scope.ServiceProvider.GetRequiredService<IdentityRoleManager>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Volo.Abp.Identity.IdentityUser>>();
            var dataSeeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();

            // Seed default roles
            await dataSeeder.SeedAsync(new DataSeedContext());

            // Create the roles if they don't exist
            var lpSpecialistRole = await EnsureRoleExistsAsync(roleManager, "LPSpecialist", "Licensing & Permit Specialist");
            var managerRole = await EnsureRoleExistsAsync(roleManager, "Manager", "Agricultural Records Manager");
            var cooRole = await EnsureRoleExistsAsync(roleManager, "COO", "Chief Operating Officer");

            // Delete existing users first
            await DeleteUserIfExistsAsync(userManager, "lp-specialist");
            await DeleteUserIfExistsAsync(userManager, "agriculture-manager");
            await DeleteUserIfExistsAsync(userManager, "coo");

            // Create users
            var lpSpecialist = await CreateUserIfNotExistsAsync(
                userManager,
                hasher,
                "lp-specialist",
                "123Qwe!", // Plain password
                "Mohammed",
                "Al Qahtani",
                "lp-specialist@example.com",
                "+966555000111",
                new[] { lpSpecialistRole.Name }
            );

            var agricultureManager = await CreateUserIfNotExistsAsync(
                userManager,
                hasher,
                "agriculture-manager",
                "123Qwe!", // Plain password
                "Saeed",
                "Al Ghamdi",
                "agriculture-manager@example.com",
                "+966555000222",
                new[] { managerRole.Name }
            );

            var coo = await CreateUserIfNotExistsAsync(
                userManager,
                hasher,
                "coo",
                "123Qwe!", // Plain password
                "Abdullah",
                "Al Otaibi",
                "coo@example.com",
                "+966555000333",
                new[] { cooRole.Name }
            );

            // Display user information for verification
            Console.WriteLine("\nCreated users:");
            await DisplayUserInfoAsync(userManager, lpSpecialist);
            await DisplayUserInfoAsync(userManager, agricultureManager);
            await DisplayUserInfoAsync(userManager, coo);
        }

        private static async Task<IdentityRole> EnsureRoleExistsAsync(IdentityRoleManager roleManager, string roleName, string displayName)
        {
            var role = await roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                Console.WriteLine($"Creating role: {roleName}");
                role = new IdentityRole(Guid.NewGuid(), roleName, null)
                {
                    IsDefault = false,
                    IsPublic = true,
                    IsStatic = true
                };

                var result = await roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    throw new Exception($"Could not create role {roleName}: {string.Join(", ", result.Errors)}");
                }
            }
            else
            {
                Console.WriteLine($"Role already exists: {roleName}");
            }

            return role;
        }

        private static async Task DeleteUserIfExistsAsync(IdentityUserManager userManager, string userName)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user != null)
            {
                Console.WriteLine($"Deleting existing user: {userName}");
                await userManager.DeleteAsync(user);
            }
        }

        private static async Task<IdentityUser> CreateUserIfNotExistsAsync(
            IdentityUserManager userManager,
            IPasswordHasher<Volo.Abp.Identity.IdentityUser> hasher,
            string userName,
            string password,
            string firstName,
            string lastName,
            string email,
            string phoneNumber,
            string[] roles)
        {
            Console.WriteLine($"Creating user: {userName}");
            var user = new IdentityUser(Guid.NewGuid(), userName, email, null)
            {
                Name = firstName,
                Surname = lastName
            };

            // Set user as active
            user.SetIsActive(true);
            
            // Set email and phone as confirmed directly
            typeof(IdentityUser).GetProperty("EmailConfirmed")?.SetValue(user, true);
            typeof(IdentityUser).GetProperty("PhoneNumberConfirmed")?.SetValue(user, true);
            
            // Set phone number
            await userManager.SetPhoneNumberAsync(user, phoneNumber);
            
            // Create the user
            var result = await userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                throw new Exception($"Could not create user {userName}: {string.Join(", ", result.Errors)}");
            }

            // Set password separately - this should create a proper hash
            var passwordResult = await userManager.AddPasswordAsync(user, password);
            if (!passwordResult.Succeeded)
            {
                throw new Exception($"Could not set password for user {userName}: {string.Join(", ", passwordResult.Errors)}");
            }

            // Get the updated user
            user = await userManager.FindByNameAsync(userName);
            Console.WriteLine($"Password hash for {userName}: {user.PasswordHash}");

            // Assign roles
            foreach (var role in roles)
            {
                if (await userManager.IsInRoleAsync(user, role))
                {
                    continue;
                }
                
                var roleResult = await userManager.AddToRoleAsync(user, role);
                if (!roleResult.Succeeded)
                {
                    throw new Exception($"Could not add user {userName} to role {role}: {string.Join(", ", roleResult.Errors)}");
                }
            }

            Console.WriteLine($"User {userName} created successfully!");
            return user;
        }

        private static async Task DisplayUserInfoAsync(IdentityUserManager userManager, IdentityUser user)
        {
            var refreshedUser = await userManager.FindByIdAsync(user.Id.ToString());
            var roles = await userManager.GetRolesAsync(refreshedUser);
            
            Console.WriteLine($"Username: {refreshedUser.UserName}");
            Console.WriteLine($"Email: {refreshedUser.Email}");
            Console.WriteLine($"Roles: {string.Join(", ", roles)}");
            Console.WriteLine($"Password Hash: {refreshedUser.PasswordHash?.Substring(0, 20)}...");
            Console.WriteLine();
        }
    }
}
