import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationService } from '../../services/application.service';
import {
  Application,
  ApplicationStatus,
  ApplicationDocument,
} from '../../models/application.model';
import { finalize } from 'rxjs/operators';

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
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private translateService: TranslateService,
    private applicationService: ApplicationService
  ) {
    this.applicationForm = this.formBuilder.group({
      title: ['', Validators.required],
      applicant: this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        nationalId: ['', Validators.required],
        address: ['', Validators.required],
      }),
      farmLocation: this.formBuilder.group({
        address: ['', Validators.required],
        size: ['', [Validators.required, Validators.min(0)]],
        crops: [[], Validators.required],
        hasIrrigationSystem: [false],
      }),
      documents: this.formBuilder.group({
        landDeed: [null, Validators.required],
        registrationCertificate: [null, Validators.required],
        environmentalCompliance: [null],
      }),
    });
  }

  ngOnInit(): void {
    console.log('[ApplicationFormComponent] Initialized');
  }

  onSubmit(): void {
    if (this.applicationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const application = this.createApplicationFromForm();

      this.applicationService
        .createApplication(application)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: savedApplication => {
            this.successMessage = 'Application submitted successfully';
            this.router.navigate(['/application', savedApplication.id]);
          },
          error: error => {
            this.errorMessage = 'Failed to submit application. Please try again.';
            console.error('Error submitting application:', error);
          },
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.markFormGroupTouched(this.applicationForm);
    }
  }

  private createApplicationFromForm(): Application {
    const formValue = this.applicationForm.value;
    const documents = this.processDocuments(formValue.documents);

    const application: Application = {
      id: 'TEMP-' + Math.floor(Math.random() * 10000).toString(), // Temporary ID
      applicationNumber: '', // Will be assigned by backend
      title: formValue.title,
      applicant: {
        id:
          'USER-' +
          (formValue.applicant.nationalId || Math.floor(Math.random() * 10000).toString()), // Temporary ID
        name: formValue.applicant.name,
        email: formValue.applicant.email,
        phone: formValue.applicant.phone,
        nationalId: formValue.applicant.nationalId,
        address: formValue.applicant.address,
      },
      farmLocation: {
        address: formValue.farmLocation.address,
        size: Number(formValue.farmLocation.size),
        crops: formValue.farmLocation.crops,
        hasIrrigationSystem: formValue.farmLocation.hasIrrigationSystem || false,
      },
      documents: documents,
      status: ApplicationStatus.DRAFT,
      submissionDate: new Date().toISOString(),
      updatedAt: new Date(),
      comments: [],
      reviews: [],
    };

    return application;
  }

  private processDocuments(documents: { [key: string]: File }): ApplicationDocument[] {
    return Object.entries(documents)
      .filter(([_, file]) => file)
      .map(([type, file], index) => ({
        id: index + 1, // Temporary ID, will be replaced by backend
        type: type,
        name: file.name,
        size: file.size,
        contentType: file.type,
        uploadDate: new Date().toISOString(),
        content: file,
      }));
  }

  onFileChange(event: Event, documentType: string): void {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
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
