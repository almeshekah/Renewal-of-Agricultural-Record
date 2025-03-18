import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-email-test',
  templateUrl: './email-test.component.html',
  styleUrls: ['./email-test.component.scss'],
})
export class EmailTestComponent implements OnInit {
  // جعل Object متاحًا للاستخدام في القالب
  Object = Object;

  emailForm: FormGroup;
  emailSettings: any = {};
  isLoading = false;
  testResult: any = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]],
      subject: ['اختبار إرسال البريد الإلكتروني من نظام تجديد السجل الزراعي'],
    });
  }

  ngOnInit(): void {
    this.getEmailSettings();
  }

  getEmailSettings(): void {
    this.isLoading = true;
    this.http.get('/api/test/email-settings').subscribe(
      (response: any) => {
        this.emailSettings = response;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching email settings:', error);
        this.isLoading = false;
      }
    );
  }

  sendTestEmail(): void {
    if (this.emailForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.testResult = null;

    const emailData = this.emailForm.value;

    this.http.post('/api/test/send-test-email', emailData).subscribe(
      (response: any) => {
        this.testResult = {
          success: true,
          message: 'تم إرسال البريد الإلكتروني بنجاح!',
        };
        this.isLoading = false;
      },
      error => {
        console.error('Error sending test email:', error);
        this.testResult = {
          success: false,
          message: 'فشل إرسال البريد الإلكتروني',
          error: error.error,
        };
        this.isLoading = false;
      }
    );
  }
}
