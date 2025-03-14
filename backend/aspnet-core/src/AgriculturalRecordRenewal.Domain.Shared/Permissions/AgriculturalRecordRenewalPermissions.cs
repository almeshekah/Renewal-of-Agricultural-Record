using Volo.Abp.Reflection;

namespace AgriculturalRecordRenewal.Permissions;

public static class AgriculturalRecordRenewalPermissions
{
    public const string GroupName = "AgriculturalRecordRenewal";

    public static class ApplicationRecords
    {
        public const string Default = GroupName + ".ApplicationRecords";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Approve = Default + ".Approve";
        public const string Reject = Default + ".Reject";
        public const string Submit = Default + ".Submit";
    }

    public static class Workflows
    {
        public const string Default = GroupName + ".Workflows";
        public const string View = Default + ".View";
        public const string Manage = Default + ".Manage";
    }

    public static class Dashboard
    {
        public const string Default = GroupName + ".Dashboard";
        public const string AdminDashboard = Default + ".Admin";
        public const string UserDashboard = Default + ".User";
        public const string ManagerDashboard = Default + ".Manager";
    }

    public static string[] GetAll()
    {
        return ReflectionHelper.GetPublicConstantsRecursively(typeof(AgriculturalRecordRenewalPermissions));
    }
} 