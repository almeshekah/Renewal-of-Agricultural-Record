using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// واجهة خدمة التطبيقات الزراعية
    /// </summary>
    public interface IAgriculturalApplicationService : IApplicationService
    {
        /// <summary>
        /// الحصول على جميع التطبيقات
        /// </summary>
        Task<List<ApplicationDto>> GetAllAsync();
        
        /// <summary>
        /// الحصول على التطبيقات المسندة لمستخدم معين
        /// </summary>
        Task<List<ApplicationDto>> GetAssignedApplicationsAsync(string userId, string role);
        
        /// <summary>
        /// الحصول على تطبيق محدد حسب المعرف
        /// </summary>
        Task<ApplicationDto> GetByIdAsync(Guid id);
        
        /// <summary>
        /// إنشاء تطبيق جديد
        /// </summary>
        Task<ApplicationDto> CreateAsync(CreateApplicationDto input);
        
        /// <summary>
        /// تحديث تطبيق
        /// </summary>
        Task<ApplicationDto> UpdateAsync(Guid id, UpdateApplicationDto input);
        
        /// <summary>
        /// حذف تطبيق
        /// </summary>
        Task DeleteAsync(Guid id);

        /// <summary>
        /// الحصول على مراجعات التطبيق
        /// </summary>
        Task<List<ReviewDto>> GetApplicationReviewsAsync(Guid applicationId);
    }
} 