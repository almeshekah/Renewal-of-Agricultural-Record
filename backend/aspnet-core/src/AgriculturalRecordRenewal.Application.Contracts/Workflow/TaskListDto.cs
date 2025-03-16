using System;

namespace AgriculturalRecordRenewal.Workflow
{
    public class TaskListDto
    {
        public TaskDto[] Tasks { get; set; } = Array.Empty<TaskDto>();
    }
} 