using System.ComponentModel.DataAnnotations;

namespace AgriculturalRecordRenewal.Workflow
{
    public class CompleteTaskDto
    {
        [Required]
        public string Decision { get; set; } = null!;

        public string? Comment { get; set; }

        [Required]
        public string UserId { get; set; } = null!;
    }
} 