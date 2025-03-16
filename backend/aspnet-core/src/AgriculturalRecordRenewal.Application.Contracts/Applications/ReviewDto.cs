using System;

namespace AgriculturalRecordRenewal.Applications
{
    /// <summary>
    /// نموذج المراجعة
    /// </summary>
    public class ReviewDto
    {
        /// <summary>
        /// معرف المراجعة
        /// </summary>
        public Guid Id { get; set; }
        
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
    }
} 