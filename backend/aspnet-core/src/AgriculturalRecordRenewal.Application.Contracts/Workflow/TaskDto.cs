using System;

namespace AgriculturalRecordRenewal.Workflow
{
    public class TaskDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Assignee { get; set; }
        public string? Created { get; set; }
        public string? DueDate { get; set; }
        public string ProcessInstanceId { get; set; } = null!;
        public string TaskDefinitionKey { get; set; } = null!;
        public string? FormKey { get; set; }
    }
} 