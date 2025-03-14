import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommandDispatcherService } from '../../../core/commands/command-dispatcher.service';
import { SubmitApplicationCommand } from '../../commands/submit-application.command';
import { LanguageService } from '../../../shared/language.service';

@Component({
	selector: 'app-application-form',
	templateUrl: './application-form.component.html',
	styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent implements OnInit {
	applicationForm: FormGroup;
	isSubmitting = false;
	errorMessage: string = null;
	successMessage: string = null;
	currentLanguage: string;

	constructor(
		private fb: FormBuilder,
		private commandDispatcher: CommandDispatcherService,
		private router: Router,
		private translate: TranslateService,
		private languageService: LanguageService
	) {}

	ngOnInit(): void {
		this.initForm();
		this.languageService.currentLanguage$.subscribe((lang) => {
			this.currentLanguage = lang;
		});
	}

	initForm(): void {
		this.applicationForm = this.fb.group({
			title: ['', [Validators.required, Validators.minLength(5)]],
			applicant: this.fb.group({
				name: ['', Validators.required],
				email: ['', [Validators.required, Validators.email]],
				phone: ['', Validators.required],
				nationalId: ['', Validators.required],
				address: ['', Validators.required],
			}),
			farmLocation: this.fb.group({
				city: ['', Validators.required],
				district: ['', Validators.required],
				coordinates: [''],
				address: ['', Validators.required],
				size: ['', [Validators.required, Validators.min(0.1)]],
				crops: ['', Validators.required],
			}),
			additionalInfo: [''],
		});
	}

	async onSubmit(): Promise<void> {
		if (this.applicationForm.invalid) {
			// Mark all fields as touched to trigger validation messages
			this.markFormGroupTouched(this.applicationForm);
			return;
		}

		this.isSubmitting = true;
		this.errorMessage = null;
		this.successMessage = null;

		try {
			const formValue = this.applicationForm.value;

			// Create command from form data
			const command = new SubmitApplicationCommand({
				title: formValue.title,
				applicant: {
					name: formValue.applicant.name,
					email: formValue.applicant.email,
					phone: formValue.applicant.phone,
				},
				farmLocation: {
					city: formValue.farmLocation.city,
					district: formValue.farmLocation.district,
					coordinates: formValue.farmLocation.coordinates,
				},
			});

			// Dispatch command
			const result = await this.commandDispatcher.dispatch(command);

			if (result.isSuccess()) {
				this.successMessage = result.message;
				// Navigate to the application detail page after successful submission
				setTimeout(() => {
					this.router.navigate(['/application/detail', result.data.id]);
				}, 2000);
			} else {
				this.errorMessage = result.message;
				if (
					result.isValidationFailure() &&
					result.errors &&
					result.errors.length > 0
				) {
					// Display validation errors
					this.errorMessage = result.errors.join(', ');
				}
			}
		} catch (error) {
			console.error('Error submitting application:', error);
			this.errorMessage = this.translate.instant(
				'application.form.error_submitting'
			);
		} finally {
			this.isSubmitting = false;
		}
	}

	// Helper method to mark all form controls as touched
	private markFormGroupTouched(formGroup: FormGroup): void {
		Object.values(formGroup.controls).forEach((control) => {
			control.markAsTouched();
			if (control instanceof FormGroup) {
				this.markFormGroupTouched(control);
			}
		});
	}
}
