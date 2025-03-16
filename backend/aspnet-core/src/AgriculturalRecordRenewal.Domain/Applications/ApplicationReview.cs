using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// كيان مراجعة التطبيق
    /// </summary>
    public class ApplicationReview : CreationAuditedEntity<Guid>
    {
        /// <summary>
        /// معرف التطبيق
        /// </summary>
        public Guid ApplicationId { get; set; }
        
        /// <summary>
        /// معرف المراجع
        /// </summary>
        public string ReviewerId { get; set; }
        
        /// <summary>
        /// اسم المراجع
        /// </summary>
        public string ReviewerName { get; set; }
        
        /// <summary>
        /// دور المراجع
        /// </summary>
        public string ReviewerRole { get; set; }
        
        /// <summary>
        /// تاريخ المراجعة
        /// </summary>
        public DateTime ReviewDate { get; set; }
        
        /// <summary>
        /// قرار المراجعة (APPROVE, REJECT, REQUEST_CHANGES)
        /// </summary>
        public string Decision { get; set; }
        
        /// <summary>
        /// تعليق المراجعة
        /// </summary>
        public string Comment { get; set; }
        
        protected ApplicationReview()
        {
        }
        
        public ApplicationReview(
            Guid id,
            Guid applicationId,
            string reviewerId,
            string reviewerName,
            string reviewerRole,
            string decision,
            string comment
        ) : base(id)
        {
            ApplicationId = applicationId;
            ReviewerId = reviewerId;
            ReviewerName = reviewerName;
            ReviewerRole = reviewerRole;
            ReviewDate = DateTime.UtcNow;
            Decision = decision;
            Comment = comment;
        }
    }
} 