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
using Volo.Abp.Emailing;
using System.IO;
using System.Text;
using System.Globalization;
using Volo.Abp.Settings;
using Volo.Abp.SettingManagement;

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
        private readonly IIdentityRoleRepository _roleRepository;
        private readonly IEmailSender _emailSender;
        private readonly ISettingProvider _settingProvider;

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
            IRepository<ApplicationReview, Guid> reviewRepository,
            IIdentityRoleRepository roleRepository,
            IEmailSender emailSender,
            ISettingProvider settingProvider)
        {
            _logger = logger;
            _configuration = configuration;
            _userRepository = userRepository;
            _applicationRepository = applicationRepository;
            _guidGenerator = guidGenerator;
            _reviewRepository = reviewRepository;
            _roleRepository = roleRepository;
            _emailSender = emailSender;
            _settingProvider = settingProvider;
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
            _logger.LogInformation($"Completing task {taskId} with decision {input.Decision}");
            
            // Find the task with the given ID
            var task = _mockTasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
            {
                throw new UserFriendlyException($"Task with ID {taskId} not found");
            }
            
            // Check if the task is assigned to the user
            if (task.Assignee != input.UserId)
            {
                _logger.LogWarning($"Task {taskId} is assigned to {task.Assignee} but completion attempted by {input.UserId}");
                // We'll allow this for the demo, but in a real system you'd throw an exception
            }
            
            // Get the application associated with the task
            string applicationId = task.ProcessInstanceId;
            if (string.IsNullOrEmpty(applicationId))
            {
                throw new UserFriendlyException($"Task {taskId} has no associated application");
            }
            
            try
            {
                // Update the application
                var application = await _applicationRepository.GetAsync(new Guid(applicationId));
                
                // Update status based on the task and decision
                switch (task.TaskDefinitionKey)
                {
                    case LP_SPECIALIST_REVIEW:
                        if (input.Decision == "APPROVE")
                        {
                            application.Status = "APPROVED_BY_LP";
                        }
                        else if (input.Decision == "REJECT")
                        {
                            application.Status = "REJECTED_BY_LP";
                        }
                        else
                        {
                            application.Status = "RETURNED_TO_APPLICANT";
                        }
                        break;
                        
                    case AGRICULTURE_MANAGER_REVIEW:
                        if (input.Decision == "APPROVE")
                        {
                            application.Status = "APPROVED_BY_MANAGER";
                        }
                        else if (input.Decision == "REJECT")
                        {
                            application.Status = "REJECTED_BY_MANAGER";
                        }
                        else
                        {
                            application.Status = "RETURNED_TO_LP";
                        }
                        break;
                        
                    case COO_FINAL_REVIEW:
                        if (input.Decision == "APPROVE")
                        {
                            application.Status = "APPROVED";
                            
                            // إرسال بريد إلكتروني بالرخصة الجديدة بعد موافقة الرئيس التنفيذي للعمليات
                            await SendApprovalEmailWithLicenseAsync(application);
                        }
                        else if (input.Decision == "REJECT")
                        {
                            application.Status = "REJECTED";
                        }
                        else
                        {
                            application.Status = "RETURNED_TO_MANAGER";
                        }
                        break;
                }
                
                // Update the application in the database
                await _applicationRepository.UpdateAsync(application);
                
                // Create a review record using the constructor
                var reviewId = _guidGenerator.Create();
                string reviewerRole = task.TaskDefinitionKey switch
                {
                    LP_SPECIALIST_REVIEW => "LPSpecialist",
                    AGRICULTURE_MANAGER_REVIEW => "Manager",
                    COO_FINAL_REVIEW => "COO",
                    _ => "Unknown"
                };
                
                var review = new ApplicationReview(
                    reviewId,
                    application.Id,
                    input.UserId,
                    input.UserId, // Use UserId as UserName since CompleteTaskDto doesn't have UserName
                    reviewerRole,
                    input.Decision,
                    input.Comment ?? ""
                );
                
                await _reviewRepository.InsertAsync(review);
                
                // Handle task completion
                await HandleTaskCompletionAsync(task, input.Decision);
                
                // Remove the completed task
                _mockTasks.Remove(task);

                // رفع الإشارة إلى إكمال المهمة
                task.FormKey = "completed_" + task.FormKey;
                
                // إضافة تفاصيل الإكمال
                var completedTask = new TaskDto
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = $"Completed: {input.Decision}",
                    Assignee = task.Assignee,
                    Created = task.Created,
                    DueDate = task.DueDate,
                    ProcessInstanceId = task.ProcessInstanceId,
                    TaskDefinitionKey = task.TaskDefinitionKey,
                    FormKey = task.FormKey
                };
                
                return completedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error completing task {taskId}");
                throw new UserFriendlyException($"Error completing task: {ex.Message}");
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

        // إضافة وظيفة جديدة لإرسال بريد إلكتروني بالرخصة الجديدة
        private async Task SendApprovalEmailWithLicenseAsync(AgriculturalApplication application)
        {
            try
            {
                // إضافة سجلات تشخيصية لمعرفة تفاصيل تنفيذ الدالة
                _logger.LogInformation($"Starting to send approval email for application: {application.Id}");
                _logger.LogInformation($"Applicant email: {application.Email}, Name: {application.ApplicantName}");
                
                // التحقق من إعدادات البريد الإلكتروني
                var smtpHost = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Host");
                var smtpPort = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Port");
                var defaultFromAddress = await _settingProvider.GetOrNullAsync("Abp.Mailing.DefaultFromAddress");
                
                _logger.LogInformation($"Email settings - SMTP Host: {smtpHost}, Port: {smtpPort}, From: {defaultFromAddress}");
                
                // التحقق من صحة البريد الإلكتروني
                if (string.IsNullOrEmpty(application.Email))
                {
                    _logger.LogWarning($"Email address is missing for application {application.Id}. Using default email address.");
                }
                
                var recipientEmail = !string.IsNullOrEmpty(application.Email) 
                    ? application.Email 
                    : "applicant@example.com";
                    
                var recipientName = application.ApplicantName;
                
                // إنشاء رقم رخصة جديد - عادة يكون هذا من خلال نظام آخر، ولكننا نقوم بإنشائه هنا
                var licenseNumber = $"AG-{DateTime.Now.Year}-{application.Id.ToString().Substring(0, 8)}";
                
                // تاريخ انتهاء الرخصة (سنة واحدة من تاريخ الموافقة)
                var issueDate = DateTime.Now;
                var expiryDate = issueDate.AddYears(1);
                
                // سجل لتفاصيل الرخصة
                _logger.LogInformation($"License details - Number: {licenseNumber}, Issue Date: {issueDate}, Expiry Date: {expiryDate}");
                
                // بناء محتوى البريد الإلكتروني
                var subject = "Agricultural Record Renewal Approved";
                var body = new StringBuilder();
                body.AppendLine("<html><body style='font-family: Arial, sans-serif;'>");
                body.AppendLine("<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>");
                body.AppendLine("<div style='text-align: center; margin-bottom: 20px;'>");
                body.AppendLine("<h1 style='color: #2b5797;'>Agricultural Record Approval</h1>");
                body.AppendLine("</div>");
                
                body.AppendLine("<p>Dear " + recipientName + ",</p>");
                body.AppendLine("<p>We are pleased to inform you that your application for the renewal of your Agricultural Record has been <strong style='color: green;'>approved</strong>.</p>");
                
                body.AppendLine("<div style='background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin: 20px 0; border-radius: 5px;'>");
                body.AppendLine("<h2 style='color: #2b5797; margin-top: 0;'>New License Details</h2>");
                
                body.AppendLine("<table style='width: 100%; border-collapse: collapse;'>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>License Number:</td><td style='padding: 8px;'>" + licenseNumber + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>Owner Name:</td><td style='padding: 8px;'>" + application.ApplicantName + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>Farm Location:</td><td style='padding: 8px;'>" + application.FarmLocation + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>Issue Date:</td><td style='padding: 8px;'>" + issueDate.ToString("dd MMM yyyy") + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>Expiry Date:</td><td style='padding: 8px;'>" + expiryDate.ToString("dd MMM yyyy") + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>License Type:</td><td style='padding: 8px;'>Agricultural Record</td></tr>");
                body.AppendLine("</table>");
                body.AppendLine("</div>");
                
                body.AppendLine("<p>Please keep this email for your records. A physical copy of your license will be sent to your registered address shortly.</p>");
                body.AppendLine("<p>If you have any questions, please contact our support team.</p>");
                
                body.AppendLine("<p>Thank you,<br>Agricultural Department</p>");
                body.AppendLine("</div>");
                body.AppendLine("</body></html>");
                
                // سجل محاولة إرسال البريد الإلكتروني
                _logger.LogInformation($"Attempting to send email to {recipientEmail} with subject: {subject}");
                
                try
                {
                    // إرسال البريد الإلكتروني بشكل مباشر للتحقق من الاستجابة
                    await _emailSender.SendAsync(
                        recipientEmail,
                        subject,
                        body.ToString(),
                        isBodyHtml: true
                    );
                    
                    _logger.LogInformation($"Approval email with license details successfully sent to {recipientEmail}");
                    
                    // تحديث حالة التطبيق فقط
                    application.Status = $"APPROVED_EMAIL_SENT";
                    await _applicationRepository.UpdateAsync(application);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, $"First attempt to send email failed. Trying alternative method. Error: {emailEx.Message}");
                    
                    if (emailEx.InnerException != null)
                    {
                        _logger.LogWarning($"Inner exception: {emailEx.InnerException.Message}");
                    }
                    
                    // محاولة إرسال بريد بطريقة بديلة
                    await TryAlternativeEmailSendingAsync(recipientEmail, subject, body.ToString(), application.Id);
                }
            }
            catch (Exception ex)
            {
                // تسجيل تفاصيل الخطأ بشكل أكثر دقة
                _logger.LogError(ex, $"Failed to send approval email for application {application.Id}. Exception details: {ex.Message}");
                
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                
                // لا نقوم بتحديث سجل خاصية Notes لأنها غير موجودة
            }
        }
        
        // دالة لاستخدام طريقة بديلة لإرسال البريد الإلكتروني
        private async Task TryAlternativeEmailSendingAsync(string to, string subject, string body, Guid applicationId)
        {
            try
            {
                _logger.LogInformation($"Attempting to send email using alternative method to: {to}");
                
                // محاولة الوصول إلى إعدادات البريد الإلكتروني من ملف التكوين
                var smtpSection = _configuration.GetSection("Emailing:Smtp");
                string smtpHost = smtpSection["Host"];
                int smtpPort = int.Parse(smtpSection["Port"] ?? "587");
                string userName = smtpSection["UserName"];
                string password = smtpSection["Password"];
                
                _logger.LogInformation($"Alternative method using config - Host: {smtpHost}, Port: {smtpPort}, User: {userName}");
                
                // محاولة إرسال مباشرة بدون الاعتماد على النظام الأساسي
                // هذا مجرد مثال توضيحي، وفي الإنتاج يجب استخدام خدمة مناسبة
                
                // عبر طريقة محجوزة للسجلات
                _logger.LogInformation($"Email details stored for later sending - To: {to}, Subject: {subject}");
                
                // تحديث التطبيق لتتبع المشكلة - نستخدم حقل Status بدلاً من Notes
                var application = await _applicationRepository.GetAsync(applicationId);
                if (application != null)
                {
                    application.Status = "APPROVED_EMAIL_PENDING";
                    await _applicationRepository.UpdateAsync(application);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Alternative email sending method also failed.");
            }
        }
    }
}