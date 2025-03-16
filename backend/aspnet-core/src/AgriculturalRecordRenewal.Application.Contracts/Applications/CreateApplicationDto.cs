using System;
using System.ComponentModel.DataAnnotations;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// نموذج بيانات إنشاء طلب تجديد سجل زراعي
    /// </summary>
    public class CreateApplicationDto
    {
        /// <summary>
        /// عنوان الطلب
        /// </summary>
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        /// <summary>
        /// اسم مقدم الطلب
        /// </summary>
        [Required]
        [StringLength(100)]
        public string ApplicantName { get; set; }
        
        /// <summary>
        /// معرف مقدم الطلب
        /// </summary>
        [Required]
        public string ApplicantId { get; set; }
        
        /// <summary>
        /// البريد الإلكتروني
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        /// <summary>
        /// رقم الجوال
        /// </summary>
        [Required]
        [Phone]
        public string MobileNumber { get; set; }
        
        /// <summary>
        /// موقع المزرعة
        /// </summary>
        [Required]
        [StringLength(200)]
        public string FarmLocation { get; set; }
        
        /// <summary>
        /// العنوان
        /// </summary>
        [Required]
        [StringLength(300)]
        public string Address { get; set; }
        
        /// <summary>
        /// نوع السجل
        /// </summary>
        [Required]
        [StringLength(100)]
        public string RecordType { get; set; }
    }
} 