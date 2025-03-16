namespace AgriculturalRecordRenewal.Workflow
{
    public class ProcessInstanceDto
    {
        public string Id { get; set; } = null!;
        public string ProcessDefinitionId { get; set; } = null!;
        public string? BusinessKey { get; set; }
        public string Status { get; set; } = null!;
    }
} 