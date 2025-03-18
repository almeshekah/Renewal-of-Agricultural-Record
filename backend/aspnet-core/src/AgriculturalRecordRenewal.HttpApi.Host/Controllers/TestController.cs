using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Text;
using Volo.Abp.Emailing;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Settings;
using System.Collections.Generic;
using Volo.Abp.Domain.Repositories;
using AgriculturalRecordRenewal.Applications;
using AgriculturalRecordRenewal.Workflow;

namespace AgriculturalRecordRenewal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // للتسهيل في الاختبار - يجب إزالة هذا في الإنتاج
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly ISettingProvider _settingProvider;
        private readonly IRepository<AgriculturalApplication, Guid> _applicationRepository;
        private readonly IWorkflowService _workflowService;

        public TestController(
            ILogger<TestController> logger,
            IConfiguration configuration,
            IEmailSender emailSender,
            ISettingProvider settingProvider,
            IRepository<AgriculturalApplication, Guid> applicationRepository,
            IWorkflowService workflowService)
        {
            _logger = logger;
            _configuration = configuration;
            _emailSender = emailSender;
            _settingProvider = settingProvider;
            _applicationRepository = applicationRepository;
            _workflowService = workflowService;
        }

        [HttpGet("email-settings")]
        public async Task<IActionResult> GetEmailSettings()
        {
            try
            {
                _logger.LogInformation("جاري جلب إعدادات البريد الإلكتروني");
                
                // جلب إعدادات البريد من مزود الإعدادات
                var smtpHost = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Host");
                var smtpPort = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Port");
                var smtpUserName = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.UserName");
                var smtpPassword = "********"; // لا نكشف كلمة المرور
                var smtpDomain = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Domain");
                var smtpEnableSsl = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.EnableSsl");
                var smtpUseDefaultCredentials = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.UseDefaultCredentials");
                var defaultFromAddress = await _settingProvider.GetOrNullAsync("Abp.Mailing.DefaultFromAddress");
                var defaultFromDisplayName = await _settingProvider.GetOrNullAsync("Abp.Mailing.DefaultFromDisplayName");

                // جلب الإعدادات مباشرة من ملف التكوين
                var configSection = _configuration.GetSection("Emailing:Smtp");
                
                var settings = new Dictionary<string, object>
                {
                    // إعدادات من مزود الإعدادات
                    { "SettingProvider:Host", smtpHost },
                    { "SettingProvider:Port", smtpPort },
                    { "SettingProvider:UserName", smtpUserName },
                    { "SettingProvider:Domain", smtpDomain },
                    { "SettingProvider:EnableSsl", smtpEnableSsl },
                    { "SettingProvider:UseDefaultCredentials", smtpUseDefaultCredentials },
                    { "SettingProvider:DefaultFromAddress", defaultFromAddress },
                    { "SettingProvider:DefaultFromDisplayName", defaultFromDisplayName },
                    
                    // إعدادات من ملف التكوين مباشرة
                    { "Configuration:Host", configSection["Host"] },
                    { "Configuration:Port", configSection["Port"] },
                    { "Configuration:UserName", configSection["UserName"] },
                    { "Configuration:EnableSsl", configSection["EnableSsl"] },
                    { "Configuration:UseDefaultCredentials", configSection["UseDefaultCredentials"] },
                    { "Configuration:Domain", configSection["Domain"] },
                    { "Configuration:DefaultFromAddress", _configuration["Emailing:DefaultFromAddress"] },
                    { "Configuration:DefaultFromDisplayName", _configuration["Emailing:DefaultFromDisplayName"] }
                };
                
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "حدث خطأ أثناء جلب إعدادات البريد الإلكتروني");
                return StatusCode(500, $"حدث خطأ أثناء جلب إعدادات البريد الإلكتروني: {ex.Message}");
            }
        }

        [HttpPost("send-test-email")]
        public async Task<IActionResult> SendTestEmail([FromBody] TestEmailModel model)
        {
            try
            {
                _logger.LogInformation($"بدء إرسال بريد إلكتروني تجريبي إلى: {model.To}");
                
                // سجل إعدادات البريد الإلكتروني للتشخيص
                var smtpHost = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Host");
                var smtpPort = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Port");
                var smtpUserName = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.UserName");
                var defaultFromAddress = await _settingProvider.GetOrNullAsync("Abp.Mailing.DefaultFromAddress");
                
                _logger.LogInformation($"إعدادات البريد الإلكتروني: SMTP Host: {smtpHost}, Port: {smtpPort}, UserName: {smtpUserName}, DefaultFromAddress: {defaultFromAddress}");
                
                // إنشاء محتوى بريد HTML بسيط
                var body = new StringBuilder();
                body.AppendLine("<html><body>");
                body.AppendLine("<h1>رسالة اختبار من نظام تجديد السجل الزراعي</h1>");
                body.AppendLine("<p>هذه رسالة تجريبية تم إرسالها للتحقق من إعدادات البريد الإلكتروني.</p>");
                body.AppendLine("<p>وقت الإرسال: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "</p>");
                body.AppendLine("</body></html>");

                // إرسال البريد الإلكتروني
                await _emailSender.SendAsync(
                    model.To,
                    model.Subject ?? "رسالة اختبار من نظام تجديد السجل الزراعي",
                    body.ToString(),
                    isBodyHtml: true
                );
                
                _logger.LogInformation($"تم إرسال البريد الإلكتروني التجريبي بنجاح إلى: {model.To}");
                
                return Ok(new { success = true, message = "تم إرسال البريد الإلكتروني التجريبي بنجاح" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"فشل إرسال البريد الإلكتروني التجريبي: {ex.Message}");
                
                if (ex.InnerException != null)
                {
                    _logger.LogError($"استثناء داخلي: {ex.InnerException.Message}");
                }
                
                return StatusCode(500, new { 
                    success = false, 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("check-application/{applicationId}")]
        public async Task<IActionResult> CheckApplicationAndSendEmail(string applicationId)
        {
            try
            {
                _logger.LogInformation($"التحقق من الطلب: {applicationId}");
                
                // التحقق من وجود الطلب
                Guid appGuid;
                if (!Guid.TryParse(applicationId, out appGuid))
                {
                    return BadRequest("معرف الطلب غير صالح");
                }
                
                var application = await _applicationRepository.FindAsync(appGuid);
                if (application == null)
                {
                    return NotFound($"الطلب ذو المعرف {applicationId} غير موجود");
                }
                
                // إرجاع معلومات الطلب
                var appInfo = new 
                {
                    Id = application.Id,
                    Number = application.ApplicationNumber,
                    Status = application.Status,
                    ApplicantName = application.ApplicantName,
                    Email = application.Email,
                    LastUpdated = application.LastUpdated
                };
                
                // إرسال البريد الإلكتروني يدويًا
                await SendEmailManually(application);
                
                return Ok(new { 
                    application = appInfo,
                    message = "تم التحقق من الطلب وإعادة إرسال البريد الإلكتروني"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"حدث خطأ أثناء التحقق من الطلب: {ex.Message}");
                return StatusCode(500, $"حدث خطأ أثناء التحقق من الطلب: {ex.Message}");
            }
        }
        
        private async Task SendEmailManually(AgriculturalApplication application)
        {
            try
            {
                // إضافة سجلات تشخيصية لمعرفة تفاصيل تنفيذ الدالة
                _logger.LogInformation($"بدء إرسال بريد إلكتروني يدوي للطلب: {application.Id}");
                _logger.LogInformation($"بريد المتقدم: {application.Email}, الاسم: {application.ApplicantName}");
                
                // التحقق من إعدادات البريد الإلكتروني
                var smtpHost = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Host");
                var smtpPort = await _settingProvider.GetOrNullAsync("Abp.Mailing.Smtp.Port");
                var defaultFromAddress = await _settingProvider.GetOrNullAsync("Abp.Mailing.DefaultFromAddress");
                
                _logger.LogInformation($"إعدادات البريد - SMTP Host: {smtpHost}, Port: {smtpPort}, From: {defaultFromAddress}");
                
                // التحقق من صحة البريد الإلكتروني
                if (string.IsNullOrEmpty(application.Email))
                {
                    _logger.LogWarning($"عنوان البريد الإلكتروني مفقود للطلب {application.Id}. استخدام عنوان افتراضي.");
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
                _logger.LogInformation($"تفاصيل الرخصة - الرقم: {licenseNumber}, تاريخ الإصدار: {issueDate}, تاريخ الانتهاء: {expiryDate}");
                
                // بناء محتوى البريد الإلكتروني
                var subject = "الموافقة على تجديد السجل الزراعي";
                var body = new StringBuilder();
                body.AppendLine("<html><body style='font-family: Arial, sans-serif;'>");
                body.AppendLine("<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>");
                body.AppendLine("<div style='text-align: center; margin-bottom: 20px;'>");
                body.AppendLine("<h1 style='color: #2b5797;'>الموافقة على السجل الزراعي</h1>");
                body.AppendLine("</div>");
                
                body.AppendLine("<p>عزيزي " + recipientName + "،</p>");
                body.AppendLine("<p>يسرنا إبلاغكم بأن طلبكم لتجديد السجل الزراعي قد تمت <strong style='color: green;'>الموافقة</strong> عليه.</p>");
                
                body.AppendLine("<div style='background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin: 20px 0; border-radius: 5px;'>");
                body.AppendLine("<h2 style='color: #2b5797; margin-top: 0;'>تفاصيل الرخصة الجديدة</h2>");
                
                body.AppendLine("<table style='width: 100%; border-collapse: collapse;'>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>رقم الرخصة:</td><td style='padding: 8px;'>" + licenseNumber + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>اسم المالك:</td><td style='padding: 8px;'>" + application.ApplicantName + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>موقع المزرعة:</td><td style='padding: 8px;'>" + application.FarmLocation + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>تاريخ الإصدار:</td><td style='padding: 8px;'>" + issueDate.ToString("dd MMM yyyy") + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>تاريخ الانتهاء:</td><td style='padding: 8px;'>" + expiryDate.ToString("dd MMM yyyy") + "</td></tr>");
                body.AppendLine("<tr><td style='padding: 8px; font-weight: bold;'>نوع الرخصة:</td><td style='padding: 8px;'>السجل الزراعي</td></tr>");
                body.AppendLine("</table>");
                body.AppendLine("</div>");
                
                body.AppendLine("<p>يرجى الاحتفاظ بهذا البريد الإلكتروني للرجوع إليه. سيتم إرسال نسخة مطبوعة من الرخصة إلى عنوانك المسجل قريبًا.</p>");
                body.AppendLine("<p>إذا كان لديك أي أسئلة، يرجى الاتصال بفريق الدعم لدينا.</p>");
                
                body.AppendLine("<p>شكرا لك،<br>قسم الزراعة</p>");
                body.AppendLine("</div>");
                body.AppendLine("</body></html>");
                
                // سجل محاولة إرسال البريد الإلكتروني
                _logger.LogInformation($"محاولة إرسال بريد إلكتروني إلى {recipientEmail} بموضوع: {subject}");
                
                // إرسال البريد الإلكتروني بشكل مباشر للتحقق من الاستجابة
                await _emailSender.SendAsync(
                    recipientEmail,
                    subject,
                    body.ToString(),
                    isBodyHtml: true
                );
                
                _logger.LogInformation($"تم إرسال بريد الموافقة بنجاح إلى {recipientEmail}");
                
                // لا نقوم بتحديث حالة الطلب حسب طلب المستخدم
            }
            catch (Exception ex)
            {
                // تسجيل تفاصيل الخطأ بشكل أكثر دقة
                _logger.LogError(ex, $"فشل في إرسال بريد الموافقة للطلب {application.Id}. تفاصيل الخطأ: {ex.Message}");
                
                if (ex.InnerException != null)
                {
                    _logger.LogError($"استثناء داخلي: {ex.InnerException.Message}");
                }
            }
        }

        [HttpGet("process-pending-emails")]
        public async Task<IActionResult> ProcessPendingEmails()
        {
            try
            {
                _logger.LogInformation("بدء معالجة البريد الإلكتروني للطلبات المعتمدة");
                
                await _workflowService.ProcessPendingEmailsAsync();
                
                return Ok(new { 
                    success = true, 
                    message = "تم إرسال البريد الإلكتروني للطلبات المعتمدة"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"فشل في معالجة البريد الإلكتروني للطلبات المعتمدة: {ex.Message}");
                return StatusCode(500, $"فشل في معالجة البريد الإلكتروني للطلبات المعتمدة: {ex.Message}");
            }
        }
    }

    public class TestEmailModel
    {
        public string To { get; set; }
        public string Subject { get; set; }
    }
} 