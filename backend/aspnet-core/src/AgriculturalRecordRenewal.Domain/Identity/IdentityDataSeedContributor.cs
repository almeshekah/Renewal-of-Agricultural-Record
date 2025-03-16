using System;
using System.Threading.Tasks;
using AgriculturalRecordRenewal.Permissions;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.PermissionManagement;
using Volo.Abp.Uow;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Reflection;
using System.Linq;

namespace AgriculturalRecordRenewal.Identity;

public class IdentityDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IIdentityRoleRepository _identityRoleRepository;
    private readonly IGuidGenerator _guidGenerator;
    private readonly IPermissionManager _permissionManager;
    private readonly ICurrentTenant _currentTenant;
    private readonly IdentityUserManager _userManager;

    public IdentityDataSeedContributor(
        IIdentityRoleRepository identityRoleRepository,
        IGuidGenerator guidGenerator,
        IPermissionManager permissionManager,
        ICurrentTenant currentTenant,
        IdentityUserManager userManager)
    {
        _identityRoleRepository = identityRoleRepository;
        _guidGenerator = guidGenerator;
        _permissionManager = permissionManager;
        _currentTenant = currentTenant;
        _userManager = userManager;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        using (_currentTenant.Change(context?.TenantId))
        {
            await SeedRolesAsync();
            await SeedUsersAsync();
        }
    }

    private async Task SeedRolesAsync()
    {
        // Applicant Role
        var applicantRole = await CreateRoleIfNotExistsAsync("Applicant", "Agricultural Record Applicant");
        await GrantPermissionsToRoleAsync(applicantRole.Name, new[]
        {
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Default,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Create,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Edit,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Submit,
            AgriculturalRecordRenewalPermissions.Dashboard.UserDashboard
        });

        // LP Specialist Role
        var lpSpecialistRole = await CreateRoleIfNotExistsAsync("LPSpecialist", "Licensing & Permit Specialist");
        await GrantPermissionsToRoleAsync(lpSpecialistRole.Name, new[]
        {
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Default,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Edit,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Approve,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Reject,
            AgriculturalRecordRenewalPermissions.Workflows.View,
            AgriculturalRecordRenewalPermissions.Dashboard.UserDashboard
        });

        // Agriculture Manager Role
        var managerRole = await CreateRoleIfNotExistsAsync("Manager", "Agricultural Records Manager");
        await GrantPermissionsToRoleAsync(managerRole.Name, new[]
        {
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Default,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Approve,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Reject,
            AgriculturalRecordRenewalPermissions.Workflows.View,
            AgriculturalRecordRenewalPermissions.Workflows.Manage,
            AgriculturalRecordRenewalPermissions.Dashboard.ManagerDashboard
        });

        // COO Role
        var cooRole = await CreateRoleIfNotExistsAsync("COO", "Chief Operating Officer");
        await GrantPermissionsToRoleAsync(cooRole.Name, new[]
        {
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Default,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Approve,
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Reject,
            AgriculturalRecordRenewalPermissions.Workflows.View,
            AgriculturalRecordRenewalPermissions.Workflows.Manage,
            AgriculturalRecordRenewalPermissions.Dashboard.AdminDashboard,
            AgriculturalRecordRenewalPermissions.Dashboard.ManagerDashboard
        });
    }

    private async Task SeedUsersAsync()
    {
        // Create LP Specialist user
        await CreateUserIfNotExistsAsync(
            "lp-specialist",
            "123Qwe!",
            "Mohammed",
            "Al Qahtani",
            "lp-specialist@example.com",
            "+966555000111",
            new List<string> { "LPSpecialist" }
        );

        // Create Agriculture Manager user
        await CreateUserIfNotExistsAsync(
            "agriculture-manager",
            "123Qwe!",
            "Saeed",
            "Al Ghamdi",
            "agriculture-manager@example.com",
            "+966555000222",
            new List<string> { "Manager" }
        );

        // Create COO user
        await CreateUserIfNotExistsAsync(
            "coo",
            "123Qwe!",
            "Abdullah",
            "Al Otaibi",
            "coo@example.com",
            "+966555000333",
            new List<string> { "COO" }
        );
    }

    private async Task<IdentityUser> CreateUserIfNotExistsAsync(
        string userName,
        string password,
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        List<string> roles)
    {
        var user = await _userManager.FindByNameAsync(userName);
        if (user == null)
        {
            // Create a new user
            user = new IdentityUser(
                _guidGenerator.Create(),
                userName,
                email,
                _currentTenant.Id
            )
            {
                Name = firstName,
                Surname = lastName
            };

            // Create the user with password
            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errorDetails = string.Join(", ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                throw new Exception($"Could not create user: {errorDetails}");
            }

            // Set phone number using the appropriate API
            await _userManager.SetPhoneNumberAsync(user, phoneNumber);
            
            // Set user as active
            user.SetIsActive(true);
            
            // Update the user with the changes
            await _userManager.UpdateAsync(user);
            
            // Use reflection to set properties that don't have public setters
            // This is a workaround for the framework's protected properties
            var userType = typeof(IdentityUser);
            var emailConfirmedProperty = userType.GetProperty("EmailConfirmed");
            var phoneConfirmedProperty = userType.GetProperty("PhoneNumberConfirmed");
            
            if (emailConfirmedProperty != null && phoneConfirmedProperty != null)
            {
                emailConfirmedProperty.SetValue(user, true);
                phoneConfirmedProperty.SetValue(user, true);
                
                // Update the user with these changes
                await _userManager.UpdateAsync(user);
            }

            // Assign roles
            foreach (var role in roles)
            {
                await _userManager.AddToRoleAsync(user, role);
            }
        }

        return user;
    }

    private async Task<IdentityRole> CreateRoleIfNotExistsAsync(string roleName, string displayName)
    {
        var role = await _identityRoleRepository.FindByNormalizedNameAsync(roleName.ToUpperInvariant());
        if (role == null)
        {
            role = new IdentityRole(
                _guidGenerator.Create(),
                roleName,
                _currentTenant.Id)
            {
                IsDefault = false,
                IsPublic = true,
                IsStatic = true
            };

            await _identityRoleRepository.InsertAsync(role);
        }

        return role;
    }

    private async Task GrantPermissionsToRoleAsync(string roleName, string[] permissions)
    {
        foreach (var permission in permissions)
        {
            await _permissionManager.SetForRoleAsync(roleName, permission, true);
        }
    }
} 