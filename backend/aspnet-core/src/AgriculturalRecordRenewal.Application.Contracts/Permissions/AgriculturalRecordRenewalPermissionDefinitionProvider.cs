using AgriculturalRecordRenewal.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace AgriculturalRecordRenewal.Permissions;

public class AgriculturalRecordRenewalPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var agriculturalRecordGroup = context.AddGroup(
            AgriculturalRecordRenewalPermissions.GroupName,
            L("Permission:AgriculturalRecordRenewal")
        );

        var applicationRecordsPermission = agriculturalRecordGroup.AddPermission(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Default,
            L("Permission:ApplicationRecords")
        );
        applicationRecordsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Create,
            L("Permission:ApplicationRecords.Create")
        );
        applicationRecordsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Edit,
            L("Permission:ApplicationRecords.Edit")
        );
        applicationRecordsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Delete,
            L("Permission:ApplicationRecords.Delete")
        );
        applicationRecordsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Approve,
            L("Permission:ApplicationRecords.Approve")
        );
        applicationRecordsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Reject,
            L("Permission:ApplicationRecords.Reject")
        );
        applicationRecordsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.ApplicationRecords.Submit,
            L("Permission:ApplicationRecords.Submit")
        );

        var workflowsPermission = agriculturalRecordGroup.AddPermission(
            AgriculturalRecordRenewalPermissions.Workflows.Default,
            L("Permission:Workflows")
        );
        workflowsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.Workflows.View,
            L("Permission:Workflows.View")
        );
        workflowsPermission.AddChild(
            AgriculturalRecordRenewalPermissions.Workflows.Manage,
            L("Permission:Workflows.Manage")
        );

        var dashboardPermission = agriculturalRecordGroup.AddPermission(
            AgriculturalRecordRenewalPermissions.Dashboard.Default,
            L("Permission:Dashboard")
        );
        dashboardPermission.AddChild(
            AgriculturalRecordRenewalPermissions.Dashboard.AdminDashboard,
            L("Permission:Dashboard.Admin")
        );
        dashboardPermission.AddChild(
            AgriculturalRecordRenewalPermissions.Dashboard.UserDashboard,
            L("Permission:Dashboard.User")
        );
        dashboardPermission.AddChild(
            AgriculturalRecordRenewalPermissions.Dashboard.ManagerDashboard,
            L("Permission:Dashboard.Manager")
        );
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<AgriculturalRecordRenewalResource>(name);
    }
}
