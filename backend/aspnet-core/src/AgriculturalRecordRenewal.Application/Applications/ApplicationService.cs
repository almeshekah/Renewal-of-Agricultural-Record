using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// تنفيذ خدمة التطبيقات الزراعية
    /// </summary>
    public class AgriculturalApplicationService : ApplicationService, IAgriculturalApplicationService
    {
        private readonly IRepository<AgriculturalApplication, Guid> _applicationRepository;
        private readonly IIdentityUserRepository _userRepository;
        private readonly ILogger<AgriculturalApplicationService> _logger;

        public AgriculturalApplicationService(
            IRepository<AgriculturalApplication, Guid> applicationRepository,
            IIdentityUserRepository userRepository,
            ILogger<AgriculturalApplicationService> logger)
        {
            _applicationRepository = applicationRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        /// <inheritdoc/>
        public async Task<List<ApplicationDto>> GetAllAsync()
        {
            _logger.LogInformation("Getting all applications");
            
            var applications = await _applicationRepository.GetListAsync();
            return applications.Select(MapToDto).ToList();
        }

        /// <inheritdoc/>
        public async Task<List<ApplicationDto>> GetAssignedApplicationsAsync(string userId, string role)
        {
            _logger.LogInformation("Getting applications assigned to user {UserId} with role {Role}", userId, role);
            
            var query = await _applicationRepository.GetQueryableAsync();
            
            // فلترة التطبيقات حسب الدور والمستخدم المخصص له
            var filteredApplications = query
                .Where(app => app.AssignedToId == userId || 
                             (role == "LPSpecialist" && app.Status == "PENDING_LP_REVIEW") ||
                             (role == "Manager" && app.Status == "PENDING_AGRICULTURE_REVIEW") ||
                             (role == "COO" && app.Status == "PENDING_COO_REVIEW"))
                .ToList();
                
            _logger.LogInformation("Found {Count} applications for user {UserId}", filteredApplications.Count, userId);
            
            return filteredApplications.Select(MapToDto).ToList();
        }

        /// <inheritdoc/>
        public async Task<ApplicationDto> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Getting application with ID {ApplicationId}", id);
            
            var application = await _applicationRepository.GetAsync(id);
            return MapToDto(application);
        }

        /// <inheritdoc/>
        public async Task<ApplicationDto> CreateAsync(CreateApplicationDto input)
        {
            _logger.LogInformation("Creating new application for {ApplicantName}", input.ApplicantName);
            
            var application = new AgriculturalApplication(
                GuidGenerator.Create(),
                GenerateApplicationNumber(),
                input.Title,
                input.ApplicantName,
                input.ApplicantId,
                "DRAFT"
            )
            {
                Email = input.Email,
                MobileNumber = input.MobileNumber,
                FarmLocation = input.FarmLocation,
                Address = input.Address,
                RecordType = input.RecordType,
                LastUpdated = DateTime.UtcNow
            };
            
            await _applicationRepository.InsertAsync(application);
            
            _logger.LogInformation("Created application with ID {ApplicationId}", application.Id);
            
            return MapToDto(application);
        }

        /// <inheritdoc/>
        public async Task<ApplicationDto> UpdateAsync(Guid id, UpdateApplicationDto input)
        {
            _logger.LogInformation("Updating application with ID {ApplicationId}", id);
            
            var application = await _applicationRepository.GetAsync(id);
            
            // تحديث الخصائص إذا تم توفيرها
            if (!string.IsNullOrEmpty(input.Title))
                application.Title = input.Title;
                
            if (!string.IsNullOrEmpty(input.Email))
                application.Email = input.Email;
                
            if (!string.IsNullOrEmpty(input.MobileNumber))
                application.MobileNumber = input.MobileNumber;
                
            if (!string.IsNullOrEmpty(input.Status))
                application.Status = input.Status;
                
            if (!string.IsNullOrEmpty(input.FarmLocation))
                application.FarmLocation = input.FarmLocation;
                
            if (!string.IsNullOrEmpty(input.Address))
                application.Address = input.Address;
                
            if (!string.IsNullOrEmpty(input.RecordType))
                application.RecordType = input.RecordType;
                
            if (!string.IsNullOrEmpty(input.AssignedToId))
                application.AssignedToId = input.AssignedToId;
                
            if (!string.IsNullOrEmpty(input.AssignedTo))
                application.AssignedTo = input.AssignedTo;
                
            application.LastUpdated = DateTime.UtcNow;
            
            await _applicationRepository.UpdateAsync(application);
            
            _logger.LogInformation("Updated application with ID {ApplicationId}", id);
            
            return MapToDto(application);
        }

        /// <inheritdoc/>
        public async Task DeleteAsync(Guid id)
        {
            _logger.LogInformation($"Deleting application with ID: {id}");
            await _applicationRepository.DeleteAsync(id);
        }
        
        /// <inheritdoc/>
        public async Task<List<ReviewDto>> GetApplicationReviewsAsync(Guid applicationId)
        {
            _logger.LogInformation($"Getting reviews for application with ID: {applicationId}");
            
            // تم تنفيذ هذه الوظيفة بشكل مؤقت لإرجاع مجموعة من المراجعات الافتراضية
            // سيتم تحديث هذه الوظيفة في المستقبل لاسترجاع المراجعات الفعلية من قاعدة البيانات
            
            var reviews = new List<ReviewDto>();
            
            // التحقق من وجود التطبيق
            var application = await _applicationRepository.GetAsync(applicationId);
            if (application == null)
            {
                _logger.LogWarning($"Application with ID {applicationId} not found");
                return reviews;
            }
            
            // إذا كانت حالة التطبيق تتجاوز مراجعة أخصائي LP، نضيف مراجعة افتراضية
            if (application.Status == "PENDING_AGRICULTURE_REVIEW" || 
                application.Status == "PENDING_COO_REVIEW" || 
                application.Status == "APPROVED" || 
                application.Status == "REJECTED")
            {
                reviews.Add(new ReviewDto
                {
                    Id = Guid.NewGuid(),
                    ReviewerId = "101",
                    ReviewerName = "LP Specialist",
                    ReviewerRole = "LPSpecialist",
                    ReviewDate = DateTime.UtcNow.AddDays(-3),
                    Decision = "APPROVE",
                    Comment = "تمت الموافقة على الطلب بعد الفحص والتدقيق"
                });
            }
            
            // إذا كانت حالة التطبيق تتجاوز مراجعة مدير الزراعة، نضيف مراجعة افتراضية
            if (application.Status == "PENDING_COO_REVIEW" || 
                application.Status == "APPROVED" || 
                application.Status == "REJECTED")
            {
                reviews.Add(new ReviewDto
                {
                    Id = Guid.NewGuid(),
                    ReviewerId = "102",
                    ReviewerName = "Agriculture Manager",
                    ReviewerRole = "Manager",
                    ReviewDate = DateTime.UtcNow.AddDays(-2),
                    Decision = "APPROVE",
                    Comment = "الطلب مستوفي للشروط والمتطلبات"
                });
            }
            
            // إذا كانت حالة التطبيق مكتملة، نضيف مراجعة افتراضية لـ COO
            if (application.Status == "APPROVED" || application.Status == "REJECTED")
            {
                reviews.Add(new ReviewDto
                {
                    Id = Guid.NewGuid(),
                    ReviewerId = "103",
                    ReviewerName = "COO",
                    ReviewerRole = "COO",
                    ReviewDate = DateTime.UtcNow.AddDays(-1),
                    Decision = application.Status == "APPROVED" ? "APPROVE" : "REJECT",
                    Comment = application.Status == "APPROVED" 
                        ? "تمت الموافقة النهائية على الطلب" 
                        : "تم رفض الطلب لعدم استيفاء المتطلبات"
                });
            }
            
            _logger.LogInformation($"Returning {reviews.Count} reviews for application {applicationId}");
            return reviews;
        }

        /// <summary>
        /// تحويل كيان التطبيق الزراعي إلى DTO
        /// </summary>
        private ApplicationDto MapToDto(AgriculturalApplication application)
        {
            return new ApplicationDto
            {
                Id = application.Id,
                ApplicationNumber = application.ApplicationNumber,
                Title = application.Title,
                ApplicantName = application.ApplicantName,
                ApplicantId = application.ApplicantId,
                Email = application.Email,
                MobileNumber = application.MobileNumber,
                Status = application.Status,
                FarmLocation = application.FarmLocation,
                Address = application.Address,
                RecordType = application.RecordType,
                SubmissionDate = application.SubmissionDate,
                LastUpdated = application.LastUpdated,
                AssignedToId = application.AssignedToId,
                AssignedTo = application.AssignedTo,
                ReviewComments = application.ReviewComments,
                CreationTime = application.CreationTime,
                LastModificationTime = application.LastModificationTime
            };
        }
        
        /// <summary>
        /// توليد رقم تطبيق جديد بالتنسيق AGR-YYYY-####
        /// </summary>
        private string GenerateApplicationNumber()
        {
            var year = DateTime.UtcNow.Year;
            var random = new Random();
            var number = random.Next(1000, 9999);
            
            return $"AGR-{year}-{number}";
        }
    }
} 