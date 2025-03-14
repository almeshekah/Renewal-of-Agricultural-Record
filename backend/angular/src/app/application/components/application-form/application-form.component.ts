import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent implements OnInit {
  applicationForm: FormGroup;
  cropTypes = ['Wheat', 'Barley', 'Corn', 'Rice', 'Dates', 'Vegetables', 'Fruits'];
  regions = [
    'Eastern Region',
    'Western Region',
    'Central Region',
    'Northern Region',
    'Southern Region',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.applicationForm = this.formBuilder.group({
      farmDetails: this.formBuilder.group({
        farmName: ['', Validators.required],
        registrationNumber: ['', Validators.required],
        location: ['', Validators.required],
        size: ['', [Validators.required, Validators.min(0)]],
        cropTypes: [[], Validators.required],
      }),
      ownerDetails: this.formBuilder.group({
        name: ['', Validators.required],
        nationalId: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        address: ['', Validators.required],
      }),
      documents: this.formBuilder.group({
        registrationCertificate: [null, Validators.required],
        landDeed: [null, Validators.required],
        environmentalCompliance: [null, Validators.required],
      }),
    });
  }

  ngOnInit(): void {
    console.log('[ApplicationFormComponent] Initialized');
  }

  onSubmit(): void {
    if (this.applicationForm.valid) {
      console.log('Form submitted:', this.applicationForm.value);
      this.router.navigate(['/applications']);
    } else {
      this.markFormGroupTouched(this.applicationForm);
    }
  }

  onFileChange(event: Event, documentType: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.applicationForm.get('documents')?.get(documentType)?.setValue(file);
    }
  }

  removeFile(documentType: string): void {
    this.applicationForm.get('documents')?.get(documentType)?.setValue(null);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    });
  }
}
