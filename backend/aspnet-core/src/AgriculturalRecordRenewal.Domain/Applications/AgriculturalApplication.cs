using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// يمثل هذا الكيان طلب تجديد سجل زراعي
    /// </summary>
    public class AgriculturalApplication : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// رقم الطلب (بالتنسيق AGR-YYYY-####)
        /// </summary>
        public string ApplicationNumber { get; set; }

        /// <summary>
        /// عنوان الطلب
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// اسم مقدم الطلب
        /// </summary>
        public string ApplicantName { get; set; }

        /// <summary>
        /// معرف مقدم الطلب
        /// </summary>
        public string ApplicantId { get; set; }

        /// <summary>
        /// البريد الإلكتروني
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// رقم الجوال
        /// </summary>
        public string MobileNumber { get; set; }

        /// <summary>
        /// حالة الطلب
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// موقع المزرعة
        /// </summary>
        public string FarmLocation { get; set; }

        /// <summary>
        /// العنوان
        /// </summary>
        public string Address { get; set; }

        /// <summary>
        /// نوع السجل
        /// </summary>
        public string RecordType { get; set; }

        /// <summary>
        /// تاريخ التقديم
        /// </summary>
        public DateTime? SubmissionDate { get; set; }

        /// <summary>
        /// آخر تحديث
        /// </summary>
        public DateTime? LastUpdated { get; set; }

        /// <summary>
        /// معرف الشخص المخصص له
        /// </summary>
        public string AssignedToId { get; set; }

        /// <summary>
        /// اسم الشخص المخصص له
        /// </summary>
        public string AssignedTo { get; set; }

        /// <summary>
        /// تعليقات المراجعة
        /// </summary>
        public List<string> ReviewComments { get; set; } = new List<string>();

        protected AgriculturalApplication()
        {
        }

        public AgriculturalApplication(
            Guid id,
            string applicationNumber,
            string title,
            string applicantName,
            string applicantId,
            string status
        ) : base(id)
        {
            ApplicationNumber = applicationNumber;
            Title = title;
            ApplicantName = applicantName;
            ApplicantId = applicantId;
            Status = status;
            LastUpdated = DateTime.UtcNow;
        }
    }
} 