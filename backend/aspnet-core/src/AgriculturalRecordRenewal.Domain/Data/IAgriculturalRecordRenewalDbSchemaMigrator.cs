using System.Threading.Tasks;

namespace AgriculturalRecordRenewal.Data;

public interface IAgriculturalRecordRenewalDbSchemaMigrator
{
    Task MigrateAsync();
}
