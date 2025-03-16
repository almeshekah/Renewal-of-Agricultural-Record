import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationDataService } from '../../../shared/services/application-data.service';
import { ApplicationService } from '../../../application/services/application.service';
import { WorkflowService } from '../../../application/services/workflow.service';
import {
  Application,
  ApplicationStatus,
  ApplicationDocument,
  Applicant,
} from '../../../application/models/application.model';
import { finalize } from 'rxjs/operators';

// Add type for documents
interface DocumentStorage {
  [key: string]: File | null;
}

interface DocumentSizes {
  [key: string]: string;
}

@Component({
  selector: 'app-agricultural-record-renewal',
  templateUrl: './agricultural-record-renewal.component.html',
  styleUrls: ['./agricultural-record-renewal.component.scss'],
})
export class AgriculturalRecordRenewalComponent implements OnInit {
  applicationForm: FormGroup;
  formSubmitted = false;
  isLoading = false;
  currentStep = 1;
  totalSteps = 4;
  applicationNumber: string = '';
  errorMessage = '';
  currentLanguage = 'en';

  // Document storage
  uploadedFiles: { [key: string]: File } = {};
  uploadedFileSizes: { [key: string]: string } = {};

  documentTypes = [
    { id: 'id', label: 'National ID' },
    { id: 'commercial', label: 'Commercial Registration' },
    { id: 'land_deed', label: 'Land Deed' },
    { id: 'prev_license', label: 'Previous Agricultural License' },
  ];

  cropsTypes = [
    { id: 'wheat', label: 'Wheat' },
    { id: 'barley', label: 'Barley' },
    { id: 'dates', label: 'Dates' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'olives', label: 'Olives' },
  ];

  regions = [
    { id: 'riyadh', label: 'Riyadh Region' },
    { id: 'makkah', label: 'Makkah Region' },
    { id: 'madinah', label: 'Madinah Region' },
    { id: 'qassim', label: 'Qassim Region' },
    { id: 'eastern', label: 'Eastern Region' },
    { id: 'asir', label: 'Asir Region' },
    { id: 'tabuk', label: 'Tabuk Region' },
    { id: 'hail', label: 'Hail Region' },
    { id: 'northern', label: 'Northern Borders Region' },
    { id: 'jazan', label: 'Jazan Region' },
    { id: 'najran', label: 'Najran Region' },
    { id: 'bahah', label: 'Al Bahah Region' },
    { id: 'jouf', label: 'Al Jouf Region' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private applicationDataService: ApplicationDataService,
    private applicationService: ApplicationService,
    private workflowService: WorkflowService
  ) {
    this.applicationForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
    this.currentLanguage = this.translate.currentLang || 'en';
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      // Personal Information (Step 1)
      personalInfo: this.fb.group({
        fullName: ['', [Validators.required]],
        nationalId: ['', [Validators.required, Validators.minLength(10)]],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern(/^(9665|05)\d{8}$/)]],
        address: ['', Validators.required],
      }),

      // Farm Information (Step 2)
      farmInfo: this.fb.group({
        location: ['', Validators.required],
        farmSize: ['', [Validators.required, Validators.min(1)]],
        cropTypes: [[], Validators.required],
        hasIrrigationSystem: [false],
        region: ['', Validators.required],
      }),

      // Previous License Information (Step 3)
      licenseInfo: this.fb.group({
        hasPreviousLicense: [false],
        licenseNumber: [''],
        issueDate: [''],
        expiryDate: [''],
        activityType: ['', Validators.required],
        notes: [''],
      }),

      // Documents (Step 4)
      documents: this.fb.group({
        id: [null],
        commercial: [null],
        land_deed: [null],
        prev_license: [null],
        termsAgreed: [false, Validators.requiredTrue],
      }),
    });

    // Update validators based on previous license checkbox
    this.applicationForm
      .get('licenseInfo.hasPreviousLicense')
      ?.valueChanges.subscribe((hasPrevLicense: boolean) => {
        const licenseNumber = this.applicationForm.get('licenseInfo.licenseNumber');
        const issueDate = this.applicationForm.get('licenseInfo.issueDate');
        const expiryDate = this.applicationForm.get('licenseInfo.expiryDate');
        const prevLicenseDoc = this.applicationForm.get('documents.prev_license');

        if (hasPrevLicense) {
          licenseNumber?.setValidators([Validators.required]);
          issueDate?.setValidators([Validators.required]);
          expiryDate?.setValidators([Validators.required]);
          prevLicenseDoc?.setValidators([Validators.required]);
        } else {
          licenseNumber?.clearValidators();
          issueDate?.clearValidators();
          expiryDate?.clearValidators();
          prevLicenseDoc?.clearValidators();
        }

        licenseNumber?.updateValueAndValidity();
        issueDate?.updateValueAndValidity();
        expiryDate?.updateValueAndValidity();
        prevLicenseDoc?.updateValueAndValidity();
      });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      const currentGroup = this.getCurrentFormGroup();

      if (currentGroup.valid) {
        this.currentStep++;
      } else {
        this.markGroupAsTouched(currentGroup);
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getCurrentFormGroup(): FormGroup {
    let groupName: string;
    switch (this.currentStep) {
      case 1:
        groupName = 'personalInfo';
        break;
      case 2:
        groupName = 'farmInfo';
        break;
      case 3:
        groupName = 'licenseInfo';
        break;
      case 4:
        groupName = 'documents';
        break;
      default:
        groupName = 'personalInfo';
    }
    return this.applicationForm.get(groupName) as FormGroup;
  }

  markGroupAsTouched(group: FormGroup): void {
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markGroupAsTouched(control);
      }
    });
  }

  onSubmit(): void {
    this.markGroupAsTouched(this.applicationForm.get('documents') as FormGroup);

    if (this.applicationForm.valid && this.isFormValid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Create application object from form data
      const applicationData = this.createApplicationObject();

      // First, create the application
      this.applicationService
        .createApplication(applicationData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: savedApplication => {
            console.log('Application created successfully:', savedApplication);
            this.applicationNumber = savedApplication.applicationNumber;
            this.formSubmitted = true;

            // Store application data for reference
            this.applicationDataService.setApplicationData({
              ...this.applicationForm.value,
              applicationId: savedApplication.id,
              applicationNumber: savedApplication.applicationNumber,
              status: savedApplication.status,
            });

            // Then, start the workflow process
            this.startWorkflowProcess(savedApplication);
          },
          error: error => {
            console.error('Error creating application:', error);
            this.errorMessage = 'Failed to create application. Please try again.';
            this.isLoading = false;
          },
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  private startWorkflowProcess(application: Application): void {
    const personalInfo = this.applicationForm.get('personalInfo')?.value;
    const farmInfo = this.applicationForm.get('farmInfo')?.value;

    const startProcessParams = {
      applicationId: application.id,
      applicantId: application.applicant.id,
      processDefinitionKey: 'agricultural-record-renewal',
      // Add the new fields
      fullName: personalInfo.fullName,
      email: personalInfo.email,
      mobileNumber: personalInfo.mobile,
      address: personalInfo.address,
      farmLocation: farmInfo.location,
    };

    this.workflowService.startProcess(startProcessParams).subscribe({
      next: processInstance => {
        console.log('Workflow process started with ID:', processInstance.id);

        // Update stored application data with process ID
        const storedData = this.applicationDataService.getApplicationData();
        this.applicationDataService.setApplicationData({
          ...storedData,
          processInstanceId: processInstance.id,
        });

        // Clear any existing workflow data
        localStorage.removeItem('agricultural_workflow_application');
        localStorage.removeItem('agricultural_workflow_current_step');

        // Navigate to the application details page
        this.router.navigate(['/applications', application.id], {
          queryParams: { processInstanceId: processInstance.id },
        });
      },
      error: error => {
        console.error('Error starting workflow:', error);
        this.errorMessage =
          'Application saved but workflow process failed to start. Please contact support.';

        // Navigate to application details even if workflow fails
        this.router.navigate(['/applications', application.id]);
      },
    });
  }

  private createApplicationObject(): Application {
    const formValue = this.applicationForm.value;
    const personalInfo = formValue.personalInfo;
    const farmInfo = formValue.farmInfo;
    const licenseInfo = formValue.licenseInfo;

    // Create applicant with required id field
    const applicant: Applicant = {
      id: 'USER-' + personalInfo.nationalId, // Using nationalId as a temporary ID
      name: personalInfo.fullName,
      nationalId: personalInfo.nationalId,
      email: personalInfo.email,
      phone: personalInfo.mobile,
      address: personalInfo.address,
    };

    const documents = this.processDocuments(formValue.documents);

    // Create the application object with all required fields
    return {
      id: 'TEMP-' + Math.floor(Math.random() * 10000).toString(), // Temporary ID
      applicationNumber: this.generateApplicationNumber(),
      title: 'Agricultural Record Renewal Application',
      applicant,
      farmLocation: {
        address: farmInfo.location,
        size: farmInfo.farmSize,
        crops: farmInfo.cropTypes,
        hasIrrigationSystem: farmInfo.hasIrrigationSystem,
        region: farmInfo.region,
      },
      address: personalInfo.address,
      previousLicense: licenseInfo.hasPreviousLicense
        ? {
            number: licenseInfo.licenseNumber,
            issueDate: licenseInfo.issueDate,
            expiryDate: licenseInfo.expiryDate,
            activityType: licenseInfo.activityType,
          }
        : undefined,
      documents,
      status: ApplicationStatus.DRAFT,
      submissionDate: null, // Will be set when submitted
      updatedAt: new Date().toISOString(),
      comments: [],
      reviews: [],
    };
  }

  private processDocuments(documents: DocumentStorage): ApplicationDocument[] {
    const result: ApplicationDocument[] = [];

    Object.entries(documents).forEach(([key, file]) => {
      if (file && key !== 'termsAgreed') {
        result.push({
          id: 0, // Will be assigned by backend
          type: key,
          name: file.name,
          size: file.size,
          contentType: file.type,
          uploadDate: new Date().toISOString(),
          content: file, // The actual file will be handled by the backend
        });
      }
    });

    return result;
  }

  get isFormValid(): boolean {
    const documents = this.applicationForm.get('documents');
    if (!documents) return false;

    const hasPreviousLicense = this.applicationForm.get('licenseInfo.hasPreviousLicense')?.value;
    const requiredDocs = ['id', 'commercial', 'land_deed'];

    if (hasPreviousLicense) {
      requiredDocs.push('prev_license');
    }

    return (
      requiredDocs.every(doc => this.uploadedFiles[doc]) &&
      documents.get('termsAgreed')?.value === true
    );
  }

  // Generate an application number using the service
  private generateApplicationNumber(): string {
    return this.applicationService.generateApplicationNumber();
  }

  // Return the application number for display in the template
  getApplicationNumber(): string {
    return this.applicationNumber;
  }

  // Navigation methods for the success modal
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToServices(): void {
    this.router.navigate(['/services']);
  }

  // Close the success modal
  closeModal(): void {
    this.formSubmitted = false;
  }

  // Document upload methods
  triggerFileInput(docTypeId: string): void {
    const fileInput = document.getElementById(`file-${docTypeId}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event, docTypeId: string): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      // Check file size (max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        this.errorMessage = 'File size exceeds 5MB limit. Please choose a smaller file.';
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Only PDF, JPG, and PNG files are allowed.';
        return;
      }

      // Store the file and update form control
      this.uploadedFiles[docTypeId] = file;
      this.uploadedFileSizes[docTypeId] = this.formatFileSize(file.size);

      // Update form control value
      this.applicationForm.get(`documents.${docTypeId}`)?.setValue(file.name);
      this.applicationForm.get(`documents.${docTypeId}`)?.markAsDirty();
      this.applicationForm.get(`documents.${docTypeId}`)?.updateValueAndValidity();

      // Clear any error message
      this.errorMessage = '';
    }
  }

  getFileName(docTypeId: string): string {
    return this.uploadedFiles[docTypeId]?.name || '';
  }

  getFileSize(docTypeId: string): string {
    return this.uploadedFileSizes[docTypeId] || '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  removeFile(docTypeId: string): void {
    delete this.uploadedFiles[docTypeId];
    delete this.uploadedFileSizes[docTypeId];

    // Clear form control value
    this.applicationForm.get(`documents.${docTypeId}`)?.setValue(null);
    this.applicationForm.get(`documents.${docTypeId}`)?.markAsDirty();
    this.applicationForm.get(`documents.${docTypeId}`)?.updateValueAndValidity();

    // Reset file input
    const fileInput = document.getElementById(`file-${docTypeId}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  shouldShowDocumentError(docTypeId: string): boolean {
    const control = this.applicationForm.get(`documents.${docTypeId}`);
    // Only show error if the document is required and the control is invalid and touched
    if (!control) return false;

    // Special case for previous license
    if (docTypeId === 'prev_license') {
      const hasPrevLicense = this.applicationForm.get('licenseInfo.hasPreviousLicense')?.value;
      return hasPrevLicense && control.invalid && control.touched;
    }

    return control.invalid && control.touched;
  }

  shouldShowError(controlName: string, groupName: string): boolean {
    const control = this.applicationForm.get(`${groupName}.${controlName}`);
    return !!control && control.invalid && control.touched;
  }

  onCropSelected(cropId: string, event: any): void {
    const cropTypesControl = this.applicationForm.get('farmInfo.cropTypes');
    const currentCrops = cropTypesControl?.value || [];

    if (event.target.checked) {
      // Add crop to the array if not already present
      if (!currentCrops.includes(cropId)) {
        cropTypesControl?.setValue([...currentCrops, cropId]);
      }
    } else {
      // Remove crop from the array
      const updatedCrops = currentCrops.filter((id: string) => id !== cropId);
      cropTypesControl?.setValue(updatedCrops);
    }

    cropTypesControl?.markAsDirty();
    cropTypesControl?.updateValueAndValidity();
  }

  // Language switching
  switchLanguage(): void {
    const newLang = this.currentLanguage === 'ar' ? 'en' : 'ar';
    this.translate.use(newLang);
    this.currentLanguage = newLang;

    // Update document direction for RTL/LTR support
    document.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }
}
