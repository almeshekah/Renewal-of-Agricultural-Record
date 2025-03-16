using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using AgriculturalRecordRenewal.Workflow;

namespace AgriculturalRecordRenewal.Controllers
{
    [RemoteService]
    [Route("api/workflow")]
    [AllowAnonymous] // Allow anonymous access for testing
    public class WorkflowController : AbpController
    {
        private readonly IWorkflowService _workflowService;

        public WorkflowController(IWorkflowService workflowService)
        {
            _workflowService = workflowService;
        }

        [HttpPost("start")]
        public async Task<ProcessInstanceDto> StartProcess([FromBody] StartProcessDto dto)
        {
            return await _workflowService.StartProcessAsync(dto);
        }

        [HttpGet("tasks/assignee/{assignee}")]
        public async Task<TaskListDto> GetTasksByAssignee(string assignee)
        {
            return await _workflowService.GetTasksByAssigneeAsync(assignee);
        }

        [HttpGet("tasks/application/{applicationId}")]
        public async Task<TaskListDto> GetTasksByApplicationId(string applicationId)
        {
            return await _workflowService.GetTasksByApplicationIdAsync(applicationId);
        }

        [HttpPost("tasks/{taskId}/complete")]
        public async Task<TaskDto> CompleteTask(string taskId, [FromBody] CompleteTaskDto input)
        {
            return await _workflowService.CompleteTaskAsync(taskId, input);
        }

        [HttpGet("tasks/current/{processInstanceId}")]
        public async Task<TaskDto> GetCurrentTask(string processInstanceId)
        {
            return await _workflowService.GetCurrentTaskAsync(processInstanceId);
        }

        [HttpPost("tasks/{taskId}/comments")]
        public async Task AddComment(string taskId, string userId, [FromBody] string message)
        {
            await _workflowService.AddCommentAsync(taskId, userId, message);
        }
    }
} 