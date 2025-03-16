using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Volo.Abp.Identity;
using Volo.Abp.Domain.Repositories;
using AgriculturalRecordRenewal.Applications;
using Volo.Abp.Guids;

namespace AgriculturalRecordRenewal.Workflow
{
    public class WorkflowService : ApplicationService, IWorkflowService
    {
        private readonly ILogger<WorkflowService> _logger;
        private readonly IConfiguration _configuration;
        private readonly List<TaskDto> _mockTasks = new();
        private readonly IIdentityUserRepository _userRepository;
        private readonly IRepository<AgriculturalApplication, Guid> _applicationRepository;
        private readonly IGuidGenerator _guidGenerator;
        private readonly IRepository<ApplicationReview, Guid> _reviewRepository;

        // Define task definition keys for each step in the workflow
        private const string LP_SPECIALIST_REVIEW = "lp_specialist_review";
        private const string AGRICULTURE_MANAGER_REVIEW = "agriculture_manager_review";
        private const string COO_FINAL_REVIEW = "coo_final_review";

        public WorkflowService(
            ILogger<WorkflowService> logger, 
            IConfiguration configuration,
            IIdentityUserRepository userRepository,
            IRepository<AgriculturalApplication, Guid> applicationRepository,
            IGuidGenerator guidGenerator,
            IRepository<ApplicationReview, Guid> reviewRepository)
        {
            _logger = logger;
            _configuration = configuration;
            _userRepository = userRepository;
            _applicationRepository = applicationRepository;
            _guidGenerator = guidGenerator;
            _reviewRepository = reviewRepository;
        }

        public async Task<ProcessInstanceDto> StartProcessAsync(StartProcessDto input)
        {
            try
            {
                _logger.LogInformation($"Starting process for application {input.ApplicationId} with process definition key {input.ProcessDefinitionKey}");
                _logger.LogInformation($"Applicant details - FullName: {input.FullName}, Email: {input.Email}, Mobile: {input.MobileNumber}");
                _logger.LogInformation($"Location details - Address: {input.Address}, Farm Location: {input.FarmLocation}");

                var processInstanceId = Guid.NewGuid().ToString();

                // Find LP Specialist user (we'll use the first one found)
                var lpSpecialist = await GetUserByRoleAsync("LPSpecialist");
                if (lpSpecialist == null)
                {
                    throw new UserFriendlyException("No LP Specialist user found to assign the task");
                }

                // Create LP Specialist review task
                var task = new TaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "LP Specialist Review",
                    Description = $"Review application {input.ApplicationId} for {input.FullName}",
                    Assignee = lpSpecialist.Id.ToString(), // Assign to LP Specialist
                    Created = DateTime.UtcNow.ToString("o"),
                    DueDate = DateTime.UtcNow.AddDays(7).ToString("o"),
                    ProcessInstanceId = processInstanceId,
                    TaskDefinitionKey = LP_SPECIALIST_REVIEW,
                    FormKey = "lp_specialist_review_form"
                };

                _mockTasks.Add(task);

                // Update application status in database
                if (!string.IsNullOrEmpty(input.ApplicationId))
                {
                    try
                    {
                        var application = await _applicationRepository.GetAsync(new Guid(input.ApplicationId));
                        
                        if (application != null)
                        {
                            application.Status = "PENDING_LP_REVIEW";
                            application.AssignedToId = lpSpecialist.Id.ToString();
                            application.AssignedTo = lpSpecialist.UserName;
                            
                            await _applicationRepository.UpdateAsync(application);
                            _logger.LogInformation($"Updated application {input.ApplicationId} status to PENDING_LP_REVIEW and assigned to {lpSpecialist.UserName}");
                        }
                        else
                        {
                            _logger.LogWarning($"Application with ID {input.ApplicationId} not found");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error updating application status: {ex.Message}");
                        // Continue with process creation even if updating application fails
                    }
                }

                return new ProcessInstanceDto
                {
                    Id = processInstanceId,
                    ProcessDefinitionId = input.ProcessDefinitionKey,
                    BusinessKey = input.ApplicationId.ToString(),
                    Status = "PENDING_LP_REVIEW"
                };
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Failed to start process", ex.Message);
            }
        }

        public async Task<TaskListDto> GetTasksByAssigneeAsync(string assignee)
        {
            try
            {
                _logger.LogInformation($"Getting tasks for assignee {assignee}");

                var tasks = _mockTasks.Where(t => t.Assignee == assignee).ToArray();

                return new TaskListDto
                {
                    Tasks = tasks
                };
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Failed to get tasks by assignee", ex.Message);
            }
        }

        public async Task<TaskListDto> GetTasksByApplicationIdAsync(string applicationId)
        {
            try
            {
                _logger.LogInformation($"Getting tasks for application {applicationId}");

                var tasks = _mockTasks.Where(t => t.ProcessInstanceId.Contains(applicationId)).ToArray();

                return new TaskListDto
                {
                    Tasks = tasks
                };
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Failed to get tasks by application ID", ex.Message);
            }
        }

        public async Task<TaskDto> CompleteTaskAsync(string taskId, CompleteTaskDto input)
        {
            try
            {
                _logger.LogInformation($"Completing task {taskId} with decision {input.Decision}");

                // Find the task
                var task = _mockTasks.FirstOrDefault(t => t.Id == taskId);
                if (task == null)
                {
                    throw new UserFriendlyException($"Task with ID {taskId} not found");
                }

                // Get application ID from process instance ID (in a real implementation, this would query the process engine)
                var applicationId = Guid.Parse(task.ProcessInstanceId);
                
                // Get the application from the repository
                var application = await _applicationRepository.GetAsync(applicationId);
                if (application == null)
                {
                    throw new UserFriendlyException($"Application with ID {applicationId} not found");
                }

                // Add review based on the task and decision
                var userId = input.UserId;
                var userName = userId; // In a real implementation, fetch the user's name
                var userRole = ""; // Will be determined by the task
                
                // Determine the role based on the task definition key
                switch (task.TaskDefinitionKey)
                {
                    case LP_SPECIALIST_REVIEW:
                        userRole = "LPSpecialist";
                        if (input.Decision == "APPROVE")
                        {
                            application.Status = "PENDING_AGRICULTURE_REVIEW";
                        }
                        else if (input.Decision == "REJECT")
                        {
                            application.Status = "REJECTED";
                        }
                        else if (input.Decision == "REQUEST_CHANGES")
                        {
                            application.Status = "RETURNED_FOR_REVISION";
                        }
                        break;
                    case AGRICULTURE_MANAGER_REVIEW:
                        userRole = "Manager";
                        if (input.Decision == "APPROVE")
                        {
                            application.Status = "PENDING_COO_REVIEW";
                        }
                        else if (input.Decision == "REJECT")
                        {
                            application.Status = "REJECTED";
                        }
                        else if (input.Decision == "REQUEST_CHANGES")
                        {
                            application.Status = "RETURNED_FOR_REVISION";
                        }
                        break;
                    case COO_FINAL_REVIEW:
                        userRole = "COO";
                        if (input.Decision == "APPROVE")
                        {
                            application.Status = "APPROVED";
                        }
                        else if (input.Decision == "REJECT" || input.Decision == "REQUEST_CHANGES")
                        {
                            application.Status = "REJECTED";
                        }
                        break;
                }
                
                // Update the application status
                await _applicationRepository.UpdateAsync(application);
                
                // Create a new review record
                var reviewId = _guidGenerator.Create();
                var review = new ApplicationReview(
                    reviewId,
                    applicationId,
                    userId,
                    userName,
                    userRole,
                    input.Decision,
                    input.Comment ?? ""
                );
                
                // Save the review to the database
                await _reviewRepository.InsertAsync(review);

                // Remove the task from active tasks
                _mockTasks.Remove(task);

                // Add comment if provided
                if (!string.IsNullOrEmpty(input.Comment))
                {
                    await AddCommentAsync(taskId, input.UserId, input.Comment);
                }

                // Handle task completion based on current task and decision
                await HandleTaskCompletionAsync(task, input.Decision);

                return new TaskDto
                {
                    Id = taskId,
                    Name = task.Name,
                    Description = $"Completed with decision: {input.Decision}"
                };
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Failed to complete task", ex.Message);
            }
        }

        public async Task<TaskDto> GetCurrentTaskAsync(string processInstanceId)
        {
            try
            {
                _logger.LogInformation($"Getting current task for process instance {processInstanceId}");

                var task = _mockTasks.FirstOrDefault(t => t.ProcessInstanceId == processInstanceId);
                return task;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Failed to get current task", ex.Message);
            }
        }

        public async Task AddCommentAsync(string taskId, string userId, string message)
        {
            try
            {
                _logger.LogInformation($"Comment for task {taskId} by user {userId}: {message}");
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Failed to add comment", ex.Message);
            }
        }

        private async Task<IdentityUser> GetUserByRoleAsync(string roleName)
        {
            // In a real application, you would use a proper method to get users by role
            // For this example, we'll use mock data or return predefined users
            string userId;
            switch (roleName)
            {
                case "LPSpecialist":
                    return new IdentityUser(Guid.Parse("00000000-0000-0000-0000-000000000101"), "lp-specialist", "lp-specialist@example.com", null);
                case "Manager":
                    return new IdentityUser(Guid.Parse("00000000-0000-0000-0000-000000000102"), "agriculture-manager", "agriculture-manager@example.com", null);
                case "COO":
                    return new IdentityUser(Guid.Parse("00000000-0000-0000-0000-000000000103"), "coo", "coo@example.com", null);
                default:
                    return null;
            }
        }

        private async Task HandleTaskCompletionAsync(TaskDto completedTask, string decision)
        {
            // Based on the completed task and decision, determine the next task
            switch (completedTask.TaskDefinitionKey)
            {
                case LP_SPECIALIST_REVIEW:
                    if (decision == "APPROVE")
                    {
                        // Create next task for Agriculture Manager
                        await CreateAgricultureManagerTaskAsync(completedTask.ProcessInstanceId);
                    }
                    break;

                case AGRICULTURE_MANAGER_REVIEW:
                    if (decision == "APPROVE")
                    {
                        // Create next task for COO
                        await CreateCOOTaskAsync(completedTask.ProcessInstanceId);
                    }
                    break;

                case COO_FINAL_REVIEW:
                    // This is the final task, no need to create a new task
                    _logger.LogInformation($"Workflow completed for process {completedTask.ProcessInstanceId} with decision {decision}");
                    break;
            }
        }

        private async Task CreateAgricultureManagerTaskAsync(string processInstanceId)
        {
            var manager = await GetUserByRoleAsync("Manager");
            if (manager == null)
            {
                throw new UserFriendlyException("No Agriculture Manager user found to assign the task");
            }

            var task = new TaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Agriculture Manager Review",
                Description = $"Review the application approved by LP Specialist",
                Assignee = manager.Id.ToString(),
                Created = DateTime.UtcNow.ToString("o"),
                DueDate = DateTime.UtcNow.AddDays(5).ToString("o"),
                ProcessInstanceId = processInstanceId,
                TaskDefinitionKey = AGRICULTURE_MANAGER_REVIEW,
                FormKey = "agriculture_manager_review_form"
            };

            _mockTasks.Add(task);
        }

        private async Task CreateCOOTaskAsync(string processInstanceId)
        {
            var coo = await GetUserByRoleAsync("COO");
            if (coo == null)
            {
                throw new UserFriendlyException("No COO user found to assign the task");
            }

            var task = new TaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "COO Final Review",
                Description = $"Final review of application approved by Agriculture Manager",
                Assignee = coo.Id.ToString(),
                Created = DateTime.UtcNow.ToString("o"),
                DueDate = DateTime.UtcNow.AddDays(3).ToString("o"),
                ProcessInstanceId = processInstanceId,
                TaskDefinitionKey = COO_FINAL_REVIEW,
                FormKey = "coo_final_review_form"
            };

            _mockTasks.Add(task);
        }
    }
}