import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationDataService } from '../../shared/services/application-data.service';

@Component({
	selector: 'app-application-form',
	templateUrl: './application-form.component.html',
	styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent implements OnInit {
	applicationForm: FormGroup;
	formSubmitted = false;
	isLoading = false;
	currentStep = 1;
	totalSteps = 4;
	applicationNumber: string = '';

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
		private applicationDataService: ApplicationDataService
	) {
		this.applicationForm = this.fb.group({});
	}

	ngOnInit(): void {
		this.initForm();
	}

	initForm(): void {
		this.applicationForm = this.fb.group({
			// Personal Information (Step 1)
			personalInfo: this.fb.group({
				fullName: ['', [Validators.required]],
				nationalId: ['', [Validators.required]],
				email: ['', [Validators.required]],
				mobile: ['', [Validators.required]],
				address: ['', Validators.required],
			}),

			// Farm Information (Step 2)
			farmInfo: this.fb.group({
				location: ['', Validators.required],
				farmSize: ['', [Validators.required, Validators.min(1)]],
				cropTypes: [[], Validators.required],
				hasIrrigationSystem: [false],
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
				const licenseNumber = this.applicationForm.get(
					'licenseInfo.licenseNumber'
				);
				const issueDate = this.applicationForm.get('licenseInfo.issueDate');
				const expiryDate = this.applicationForm.get('licenseInfo.expiryDate');
				const prevLicenseDoc = this.applicationForm.get(
					'documents.prev_license'
				);

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
		Object.keys(group.controls).forEach((key) => {
			const control = group.get(key);
			control?.markAsTouched();

			if (control instanceof FormGroup) {
				this.markGroupAsTouched(control);
			}
		});
	}

	onSubmit(): void {
		this.markGroupAsTouched(this.applicationForm.get('documents') as FormGroup);

		if (this.applicationForm.valid) {
			this.isLoading = true;
			console.log('Form submitted', this.applicationForm.value);
			console.log('Uploaded files', this.uploadedFiles);

			// Fix any potential validation issues for demo purposes
			this.ensureFormValuesForSubmission();

			// Save the form data to the ApplicationDataService
			this.applicationDataService.setApplicationData(
				this.applicationForm.value
			);

			// Reset any existing workflow data
			localStorage.removeItem('agricultural_workflow_application');
			localStorage.removeItem('agricultural_workflow_current_step');

			// Create the main application entry for testing
			this.createTestApplicationEntries();

			// Generate an application number
			this.generateApplicationNumber();

			// Simulate form submission delay
			setTimeout(() => {
				this.isLoading = false;
				this.formSubmitted = true;

				// The navigation is now handled by the buttons in the success modal
				// instead of automatically navigating to login
			}, 1500);
		}
	}

	// Generate a random application number
	private generateApplicationNumber(): void {
		const prefix = 'AGR';
		const year = new Date().getFullYear();
		const randomDigits = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, '0');
		this.applicationNumber = `${prefix}-${year}-${randomDigits}`;
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
		this.router.navigate(['/home/services']);
	}

	// Close the success modal
	closeModal(): void {
		this.formSubmitted = false;
	}

	// Document upload methods
	triggerFileInput(docTypeId: string): void {
		const fileInput = document.getElementById(
			`file-${docTypeId}`
		) as HTMLInputElement;
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
				alert(`File size exceeds 5MB limit. Please choose a smaller file.`);
				return;
			}

			// Check file type
			const allowedTypes = [
				'application/pdf',
				'image/jpeg',
				'image/jpg',
				'image/png',
			];
			if (!allowedTypes.includes(file.type)) {
				alert('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
				return;
			}

			// Store the file and update form control
			this.uploadedFiles[docTypeId] = file;
			this.uploadedFileSizes[docTypeId] = this.formatFileSize(file.size);

			// Update form control value
			this.applicationForm.get(`documents.${docTypeId}`)?.setValue(file.name);
			this.applicationForm.get(`documents.${docTypeId}`)?.markAsDirty();
			this.applicationForm
				.get(`documents.${docTypeId}`)
				?.updateValueAndValidity();
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
		this.applicationForm
			.get(`documents.${docTypeId}`)
			?.updateValueAndValidity();

		// Reset file input
		const fileInput = document.getElementById(
			`file-${docTypeId}`
		) as HTMLInputElement;
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
			const hasPrevLicense = this.applicationForm.get(
				'licenseInfo.hasPreviousLicense'
			)?.value;
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

	get isFormValid(): boolean {
		if (this.currentStep !== this.totalSteps) {
			return true; // Only check validity on the last step for submit button
		}

		const documentsGroup = this.applicationForm.get('documents') as FormGroup;
		const hasPrevLicense = this.applicationForm.get(
			'licenseInfo.hasPreviousLicense'
		)?.value;

		// Validate required document uploads
		const idValid = !!this.uploadedFiles['id'];
		const commercialValid = !!this.uploadedFiles['commercial'];
		const landDeedValid = !!this.uploadedFiles['land_deed'];
		const prevLicenseValid =
			!hasPrevLicense || !!this.uploadedFiles['prev_license'];

		// Validate terms agreement
		const termsAgreed = this.applicationForm.get(
			'documents.termsAgreed'
		)?.value;

		return (
			idValid &&
			commercialValid &&
			landDeedValid &&
			prevLicenseValid &&
			termsAgreed
		);
	}

	// Ensure the form has valid values for required fields
	private ensureFormValuesForSubmission(): void {
		const personalInfo = this.applicationForm.get('personalInfo');
		if (personalInfo) {
			if (!personalInfo.get('fullName')?.value) {
				personalInfo.get('fullName')?.setValue('Demo User');
			}
			if (!personalInfo.get('nationalId')?.value) {
				personalInfo.get('nationalId')?.setValue('1234567890');
			}
			if (!personalInfo.get('email')?.value) {
				personalInfo.get('email')?.setValue('demo@example.com');
			}
			if (!personalInfo.get('mobile')?.value) {
				personalInfo.get('mobile')?.setValue('9665XXXXXXXX');
			}
			if (!personalInfo.get('address')?.value) {
				personalInfo.get('address')?.setValue('Demo Address');
			}
		}

		const farmInfo = this.applicationForm.get('farmInfo');
		if (farmInfo) {
			if (!farmInfo.get('location')?.value) {
				farmInfo.get('location')?.setValue('Demo Location');
			}
			if (!farmInfo.get('farmSize')?.value) {
				farmInfo.get('farmSize')?.setValue(100);
			}
			if (
				!farmInfo.get('cropTypes')?.value ||
				farmInfo.get('cropTypes')?.value.length === 0
			) {
				farmInfo.get('cropTypes')?.setValue(['wheat']);
			}
		}

		const licenseInfo = this.applicationForm.get('licenseInfo');
		if (licenseInfo) {
			if (!licenseInfo.get('activityType')?.value) {
				licenseInfo.get('activityType')?.setValue('crops');
			}
		}

		// Make sure terms are agreed to
		this.applicationForm.get('documents.termsAgreed')?.setValue(true);
	}

	// Create multiple application entries with different statuses
	private createTestApplicationEntries(): void {
		const formData = this.applicationForm.value;
		const personalInfo = formData.personalInfo || {};
		const farmInfo = formData.farmInfo || {};

		// Clear previous test applications
		localStorage.removeItem('agricultural_test_applications');

		// Common application data from the form
		const baseAppId = Math.floor(Math.random() * 10000);
		const baseAppNumber = 'AGR-' + new Date().getFullYear() + '-';
		const currentDate = new Date();

		// Generate applications with different statuses for each role
		const applications = [
			// LP Specialist application (Under LP Review)
			{
				id: baseAppId,
				applicationNumber: baseAppNumber + baseAppId,
				title: `${personalInfo.fullName}'s Farm Renewal Application`,
				description: 'Agricultural record renewal application',
				status: 'UNDER_REVIEW_LP',
				submittedAt: currentDate,
				updatedAt: currentDate,
				applicant: {
					id: 999,
					name: personalInfo.fullName || 'Demo User',
					email: personalInfo.email || 'demo@example.com',
					phone: personalInfo.mobile || '9665XXXXXXXX',
					nationalId: personalInfo.nationalId || '1234567890',
					address: personalInfo.address || 'Demo Address',
				},
				farmLocation: {
					address: farmInfo.location || 'Unknown Location',
					size: farmInfo.farmSize || 100,
					crops: farmInfo.cropTypes || ['Unknown'],
				},
				documents: [],
				comments: [],
			},

			// LP Specialist application (Returned by LP)
			{
				id: baseAppId + 1,
				applicationNumber: baseAppNumber + (baseAppId + 1),
				title: `${personalInfo.fullName}'s Farm Renewal Application (Returned)`,
				description: 'Agricultural record renewal application',
				status: 'RETURNED_BY_LP',
				submittedAt: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
				updatedAt: currentDate,
				applicant: {
					id: 999,
					name: personalInfo.fullName || 'Demo User',
					email: personalInfo.email || 'demo@example.com',
					phone: personalInfo.mobile || '9665XXXXXXXX',
					nationalId: personalInfo.nationalId || '1234567890',
					address: personalInfo.address || 'Demo Address',
				},
				farmLocation: {
					address: farmInfo.location || 'Unknown Location',
					size: farmInfo.farmSize || 100,
					crops: farmInfo.cropTypes || ['Unknown'],
				},
				documents: [],
				comments: [],
			},

			// Agriculture Manager application (Under Manager Review)
			{
				id: baseAppId + 2,
				applicationNumber: baseAppNumber + (baseAppId + 2),
				title: `${personalInfo.fullName}'s Farm Renewal Application`,
				description: 'Agricultural record renewal application',
				status: 'UNDER_REVIEW_MANAGER',
				submittedAt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
				updatedAt: currentDate,
				applicant: {
					id: 999,
					name: personalInfo.fullName || 'Demo User',
					email: personalInfo.email || 'demo@example.com',
					phone: personalInfo.mobile || '9665XXXXXXXX',
					nationalId: personalInfo.nationalId || '1234567890',
					address: personalInfo.address || 'Demo Address',
				},
				farmLocation: {
					address: farmInfo.location || 'Unknown Location',
					size: farmInfo.farmSize || 100,
					crops: farmInfo.cropTypes || ['Unknown'],
				},
				documents: [],
				comments: [],
			},

			// Agriculture Manager application (Ready for Manager)
			{
				id: baseAppId + 3,
				applicationNumber: baseAppNumber + (baseAppId + 3),
				title: `${personalInfo.fullName}'s Farm Renewal Application (LP Approved)`,
				description: 'Agricultural record renewal application',
				status: 'APPROVED_BY_LP',
				submittedAt: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
				updatedAt: currentDate,
				applicant: {
					id: 999,
					name: personalInfo.fullName || 'Demo User',
					email: personalInfo.email || 'demo@example.com',
					phone: personalInfo.mobile || '9665XXXXXXXX',
					nationalId: personalInfo.nationalId || '1234567890',
					address: personalInfo.address || 'Demo Address',
				},
				farmLocation: {
					address: farmInfo.location || 'Unknown Location',
					size: farmInfo.farmSize || 100,
					crops: farmInfo.cropTypes || ['Unknown'],
				},
				documents: [],
				comments: [],
			},

			// COO application (Under COO Review)
			{
				id: baseAppId + 4,
				applicationNumber: baseAppNumber + (baseAppId + 4),
				title: `${personalInfo.fullName}'s Farm Renewal Application`,
				description: 'Agricultural record renewal application',
				status: 'UNDER_REVIEW_COO',
				submittedAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
				updatedAt: currentDate,
				applicant: {
					id: 999,
					name: personalInfo.fullName || 'Demo User',
					email: personalInfo.email || 'demo@example.com',
					phone: personalInfo.mobile || '9665XXXXXXXX',
					nationalId: personalInfo.nationalId || '1234567890',
					address: personalInfo.address || 'Demo Address',
				},
				farmLocation: {
					address: farmInfo.location || 'Unknown Location',
					size: farmInfo.farmSize || 100,
					crops: farmInfo.cropTypes || ['Unknown'],
				},
				documents: [],
				comments: [],
			},

			// COO application (Ready for COO)
			{
				id: baseAppId + 5,
				applicationNumber: baseAppNumber + (baseAppId + 5),
				title: `${personalInfo.fullName}'s Farm Renewal Application (Manager Approved)`,
				description: 'Agricultural record renewal application',
				status: 'APPROVED_BY_MANAGER',
				submittedAt: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
				updatedAt: currentDate,
				applicant: {
					id: 999,
					name: personalInfo.fullName || 'Demo User',
					email: personalInfo.email || 'demo@example.com',
					phone: personalInfo.mobile || '9665XXXXXXXX',
					nationalId: personalInfo.nationalId || '1234567890',
					address: personalInfo.address || 'Demo Address',
				},
				farmLocation: {
					address: farmInfo.location || 'Unknown Location',
					size: farmInfo.farmSize || 100,
					crops: farmInfo.cropTypes || ['Unknown'],
				},
				documents: [],
				comments: [],
			},
		];

		// Store the applications in localStorage
		localStorage.setItem(
			'agricultural_applications',
			JSON.stringify(applications)
		);

		// Also store the single submitted application details for workflow
		const submittedData = {
			applicationId: 'APP-' + baseAppId,
			applicationNumber: baseAppNumber + baseAppId,
			title: `${personalInfo.fullName}'s Farm Renewal Application`,
			applicantName: personalInfo.fullName,
			farmLocation: farmInfo.location,
			farmSize: farmInfo.farmSize,
			cropTypes: farmInfo.cropTypes,
			status: 'SUBMITTED',
		};

		// Store the submitted data for workflow
		localStorage.setItem(
			'submitted_application_details',
			JSON.stringify(submittedData)
		);
	}
}
