using System.ComponentModel.DataAnnotations;
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AgriculturalRecordRenewal.Workflow
{
    public class StartProcessDto
    {
        [JsonProperty("applicationId")]
        public string ApplicationId { get; set; }

        [Required]
        public string ApplicantId { get; set; } = null!;

        [Required]
        public string ProcessDefinitionKey { get; set; } = null!;
        
        // New fields
        [JsonProperty("fullName")]
        public string FullName { get; set; }
        
        [JsonProperty("email")]
        [EmailAddress]
        public string Email { get; set; }
        
        [JsonProperty("mobileNumber")]
        public string MobileNumber { get; set; }
        
        [JsonProperty("address")]
        public string Address { get; set; }
        
        [JsonProperty("farmLocation")]
        public string FarmLocation { get; set; }
    }
} 