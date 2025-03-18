using System.Threading.Tasks;
using System;
using Volo.Abp.Application.Services;

namespace AgriculturalRecordRenewal.Workflow
{
    public interface IWorkflowService : IApplicationService
    {
        Task<ProcessInstanceDto> StartProcessAsync(StartProcessDto input);
        Task<TaskListDto> GetTasksByAssigneeAsync(string assignee);
        Task<TaskListDto> GetTasksByApplicationIdAsync(string applicationId);
        Task<TaskDto> CompleteTaskAsync(string taskId, CompleteTaskDto input);
        Task<TaskDto> GetCurrentTaskAsync(string processInstanceId);
        Task AddCommentAsync(string taskId, string userId, string message);
        Task ProcessPendingEmailsAsync();
    }
} 