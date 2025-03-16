using System;
using System.ComponentModel.DataAnnotations;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// نموذج بيانات تحديث طلب تجديد سجل زراعي
    /// </summary>
    public class UpdateApplicationDto
    {
        /// <summary>
        /// عنوان الطلب
        /// </summary>
        [StringLength(200)]
        public string Title { get; set; }
        
        /// <summary>
        /// البريد الإلكتروني
        /// </summary>
        [EmailAddress]
        public string Email { get; set; }
        
        /// <summary>
        /// رقم الجوال
        /// </summary>
        [Phone]
        public string MobileNumber { get; set; }
        
        /// <summary>
        /// حالة الطلب
        /// </summary>
        public string Status { get; set; }
        
        /// <summary>
        /// موقع المزرعة
        /// </summary>
        [StringLength(200)]
        public string FarmLocation { get; set; }
        
        /// <summary>
        /// العنوان
        /// </summary>
        [StringLength(300)]
        public string Address { get; set; }
        
        /// <summary>
        /// نوع السجل
        /// </summary>
        [StringLength(100)]
        public string RecordType { get; set; }
        
        /// <summary>
        /// معرف الشخص المخصص له
        /// </summary>
        public string AssignedToId { get; set; }
        
        /// <summary>
        /// اسم الشخص المخصص له
        /// </summary>
        public string AssignedTo { get; set; }
    }
} 