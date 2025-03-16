using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AgriculturalRecordRenewal.Applications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using System.Linq;

namespace AgriculturalRecordRenewal.Controllers
{
    /// <summary>
    /// وحدة تحكم API للتطبيقات الزراعية
    /// </summary>
    [RemoteService]
    [Route("api/applications")]
    [Authorize]
    public class ApplicationsController : AgriculturalRecordRenewalController
    {
        private readonly IAgriculturalApplicationService _applicationService;
        private readonly ILogger<ApplicationsController> _logger;

        public ApplicationsController(
            IAgriculturalApplicationService applicationService,
            ILogger<ApplicationsController> logger)
        {
            _applicationService = applicationService;
            _logger = logger;
        }

        /// <summary>
        /// الحصول على جميع التطبيقات
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<List<ApplicationDto>> GetAllAsync()
        {
            _logger.LogInformation("API call: GetAllApplications");
            return await _applicationService.GetAllAsync();
        }

        /// <summary>
        /// الحصول على التطبيقات المسندة
        /// </summary>
        [HttpGet("assigned")]
        public async Task<List<ApplicationDto>> GetAssignedApplicationsAsync([FromQuery] string userId, [FromQuery] string role)
        {
            _logger.LogInformation("API call: GetAssignedApplications for UserId: {userId}, Role: {role}", userId, role);
            
            if (string.IsNullOrEmpty(userId) && CurrentUser.Id.HasValue)
            {
                userId = CurrentUser.Id.Value.ToString();
                _logger.LogInformation("Using current user ID: {userId}", userId);
            }
            
            if (string.IsNullOrEmpty(role) && CurrentUser.Roles != null && CurrentUser.Roles.Any())
            {
                role = CurrentUser.Roles.FirstOrDefault();
                _logger.LogInformation("Using current user role: {role}", role);
            }
            
            return await _applicationService.GetAssignedApplicationsAsync(userId, role);
        }

        /// <summary>
        /// الحصول على تطبيق محدد حسب المعرف
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ApplicationDto> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("API call: GetApplicationById with ID: {id}", id);
            return await _applicationService.GetByIdAsync(id);
        }

        /// <summary>
        /// إنشاء تطبيق جديد
        /// </summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<ApplicationDto> CreateAsync([FromBody] CreateApplicationDto input)
        {
            _logger.LogInformation("API call: CreateApplication for Applicant: {applicantName}", input.ApplicantName);
            return await _applicationService.CreateAsync(input);
        }

        /// <summary>
        /// تحديث تطبيق
        /// </summary>
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ApplicationDto> UpdateAsync(Guid id, [FromBody] UpdateApplicationDto input)
        {
            _logger.LogInformation("API call: UpdateApplication with ID: {id}", id);
            return await _applicationService.UpdateAsync(id, input);
        }

        /// <summary>
        /// حذف تطبيق
        /// </summary>
        [HttpDelete("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            _logger.LogInformation("API call: DeleteApplication with ID: {id}", id);
            await _applicationService.DeleteAsync(id);
        }
        
        /// <summary>
        /// الحصول على مراجعات التطبيق
        /// </summary>
        [HttpGet("{id}/reviews")]
        [AllowAnonymous]
        public async Task<List<ReviewDto>> GetApplicationReviewsAsync(Guid id)
        {
            _logger.LogInformation("API call: GetApplicationReviews for application ID: {id}", id);
            return await _applicationService.GetApplicationReviewsAsync(id);
        }
    }
} 