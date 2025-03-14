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

namespace AgriculturalRecordRenewal.Identity;

public class IdentityDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IIdentityRoleRepository _identityRoleRepository;
    private readonly IGuidGenerator _guidGenerator;
    private readonly IPermissionManager _permissionManager;
    private readonly ICurrentTenant _currentTenant;

    public IdentityDataSeedContributor(
        IIdentityRoleRepository identityRoleRepository,
        IGuidGenerator guidGenerator,
        IPermissionManager permissionManager,
        ICurrentTenant currentTenant)
    {
        _identityRoleRepository = identityRoleRepository;
        _guidGenerator = guidGenerator;
        _permissionManager = permissionManager;
        _currentTenant = currentTenant;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        using (_currentTenant.Change(context?.TenantId))
        {
            await SeedRolesAsync();
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

        // L&P Specialist Role
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

        // Manager Role
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