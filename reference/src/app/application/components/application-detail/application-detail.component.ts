import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommandDispatcherService } from '../../../core/commands/command-dispatcher.service';
import { ReviewDecisionCommand } from '../../commands/review-decision.command';
import {
	Application,
	ApplicationStatus,
	ApplicationStatusType,
} from '../../models/application.model';
import { LanguageService } from '../../../shared/language.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../../auth/services/auth.service';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { User } from '../../../auth/models/user.model';
import { WorkflowService } from '../../services/workflow.service';

@Component({
	selector: 'app-application-detail',
	templateUrl: './application-detail.component.html',
	styleUrls: ['./application-detail.component.scss'],
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
	applicationId: string;
	application: Application;
	reviewForm: FormGroup;
	isLoading = false;
	hasError = false;
	errorMessage = '';
	isSubmitting = false;
	successMessage: string = null;
	currentLanguage: string;

	// User information
	currentUser: User | null = null;
	userRole = '';
	userName = '';
	userId = '';

	// Enum for application status
	ApplicationStatus = ApplicationStatus;

	// Flags for role-based UI
	canReview = false;
	isLPSpecialist = false;
	isAgricultureManager = false;
	isCOO = false;
	allowedActions: string[] = [];

	private destroy$ = new Subject<void>();

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fb: FormBuilder,
		private commandDispatcher: CommandDispatcherService,
		private translate: TranslateService,
		private languageService: LanguageService,
		private applicationService: ApplicationService,
		private authService: AuthService,
		private workflowService: WorkflowService
	) {
		this.applicationId = '';
		this.application = {} as Application;
		this.reviewForm = this.fb.group({
			decision: ['APPROVE', Validators.required],
			comments: ['', [Validators.required, Validators.maxLength(500)]],
		});
	}

	ngOnInit(): void {
		// Initialize the form
		this.initForm();
		console.log('Application Detail Component initialized');

		// Get the current authenticated user first
		this.currentUser = this.authService.getCurrentUser();

		if (this.currentUser) {
			console.log('User authenticated:', this.currentUser);
			// Use fullName instead of name
			this.userName = this.currentUser.fullName;
			this.userRole = this.currentUser.role;
			// Convert id from number to string
			this.userId = this.currentUser.id.toString();

			// Set role flags based on user role
			this.isLPSpecialist = this.userRole === 'lp-specialist';
			this.isAgricultureManager = this.userRole === 'agriculture-manager';
			this.isCOO = this.userRole === 'coo';

			console.log('User role detected:', this.userRole);
			console.log('Role flags:', {
				isLPSpecialist: this.isLPSpecialist,
				isAgricultureManager: this.isAgricultureManager,
				isCOO: this.isCOO,
			});
		} else {
			console.warn('No user found from auth service, using fallback user data');
			this.userName = 'Mohammed Al Qahtani';
			this.userRole = 'lp-specialist';
			this.userId = '2';
			this.isLPSpecialist = true;

			console.log('Using fallback user role:', this.userRole);
		}

		// Get the application ID from the route params
		this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const id = params.get('id');
			if (id) {
				console.log(`URL parameter 'id' found: ${id}`);
				this.applicationId = id;
				this.loadApplication(id);
			} else {
				console.error('No application ID found in URL parameters');
				this.hasError = true;
				this.errorMessage =
					'No application ID provided. Please select an application from the list.';
			}
		});

		// Subscribe to language changes
		this.languageService.currentLanguage$
			.pipe(takeUntil(this.destroy$))
			.subscribe((lang) => {
				this.currentLanguage = lang;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	// Initialize review form
	initForm(): void {
		this.reviewForm = this.fb.group({
			decision: ['APPROVE', Validators.required],
			comments: ['', [Validators.required, Validators.maxLength(500)]],
		});
	}

	// Load application details from service
	loadApplication(id: string): void {
		this.isLoading = true;
		this.hasError = false;
		this.errorMessage = '';
		this.successMessage = null;

		console.log(`Loading application details for ID: ${id}`);

		this.applicationService
			.getApplication(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (application) => {
					console.log('Application loaded successfully:', application);
					this.application = application;

					// Update permissions based on the user's role and application status
					this.updateUserPermissions();

					// Set page title with application info
					document.title = `Application ${application.applicationNumber} - ${application.title}`;

					this.isLoading = false;
				},
				error: (error) => {
					console.error('Error loading application:', error);
					this.isLoading = false;
					this.hasError = true;
					this.errorMessage = `Failed to load application with ID ${id}. Please try again.`;
				},
			});
	}

	// Determine what actions the current user can take based on their role and the application status
	private updateUserPermissions(): void {
		// Check if application is loaded
		if (!this.application) {
			console.warn('Cannot update permissions: application not loaded');
			return;
		}

		console.log('Updating user permissions...');
		console.log('Current user role:', this.userRole);
		console.log('Current application status:', this.application.status);

		// Reset all role flags first
		this.isLPSpecialist = false;
		this.isAgricultureManager = false;
		this.isCOO = false;

		// Set the correct role flag based on user role
		if (this.userRole === 'lp-specialist') {
			this.isLPSpecialist = true;
		} else if (this.userRole === 'agriculture-manager') {
			this.isAgricultureManager = true;
		} else if (this.userRole === 'coo') {
			this.isCOO = true;
		}

		console.log('Role flags set:', {
			isLPSpecialist: this.isLPSpecialist,
			isAgricultureManager: this.isAgricultureManager,
			isCOO: this.isCOO,
		});

		// Reset review permissions
		this.canReview = false;
		this.allowedActions = [];

		// Update permissions based on role and application status
		if (this.isLPSpecialist) {
			// LP Specialist can review when status is SUBMITTED or UNDER_REVIEW_LP
			this.canReview =
				this.application.status === ApplicationStatus.SUBMITTED ||
				this.application.status === ApplicationStatus.UNDER_REVIEW_LP;

			if (this.canReview) {
				this.allowedActions = ['APPROVE', 'RETURN'];
			}
		} else if (this.isAgricultureManager) {
			// Agriculture Manager can review when status is APPROVED_BY_LP or UNDER_REVIEW_MANAGER
			this.canReview =
				this.application.status === ApplicationStatus.APPROVED_BY_LP ||
				this.application.status === ApplicationStatus.UNDER_REVIEW_MANAGER;

			if (this.canReview) {
				this.allowedActions = ['APPROVE', 'RETURN'];
			}
		} else if (this.isCOO) {
			// COO can review when status is APPROVED_BY_MANAGER or UNDER_REVIEW_COO
			this.canReview =
				this.application.status === ApplicationStatus.APPROVED_BY_MANAGER ||
				this.application.status === ApplicationStatus.UNDER_REVIEW_COO;

			if (this.canReview) {
				this.allowedActions = ['APPROVE', 'RETURN', 'REJECT'];
			}
		}

		console.log('Updated permissions:', {
			canReview: this.canReview,
			allowedActions: this.allowedActions,
			isLPSpecialist: this.isLPSpecialist,
			isAgricultureManager: this.isAgricultureManager,
			isCOO: this.isCOO,
		});
	}

	// Submit review decision based on user role
	submitReview(): void {
		if (this.reviewForm.invalid) {
			return;
		}

		this.isSubmitting = true;
		this.errorMessage = '';
		this.successMessage = '';

		const formValue = this.reviewForm.value;
		const reviewData = {
			applicationId: this.applicationId,
			decision: formValue.decision,
			comments: formValue.comments,
			reviewerId: this.userId,
			reviewerName: this.userName,
			reviewerRole: this.userRole,
		};

		console.log('Submitting review:', reviewData);
		console.log('User role:', this.userRole);

		let reviewObservable;

		// Choose the correct service method based on the user's role
		if (this.isLPSpecialist) {
			console.log('Using submitSpecialistReview');
			reviewObservable =
				this.applicationService.submitSpecialistReview(reviewData);
		} else if (this.isAgricultureManager) {
			console.log('Using submitManagerReview');
			reviewObservable =
				this.applicationService.submitManagerReview(reviewData);
		} else if (this.isCOO) {
			console.log('Using submitCOOReview');
			reviewObservable = this.applicationService.submitCOOReview(reviewData);
		} else {
			this.isSubmitting = false;
			this.errorMessage = 'You do not have permission to submit a review.';
			return;
		}

		reviewObservable
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					console.error('Error submitting review:', error);
					this.errorMessage = 'Failed to submit review. Please try again.';
					this.isSubmitting = false;
					return of(null);
				})
			)
			.subscribe((result) => {
				if (result) {
					console.log('Review submitted successfully:', result);
					this.successMessage = 'Review submitted successfully.';
					this.application = result; // Update the local application with the response
					this.updateUserPermissions(); // Update permissions based on new status
					this.reviewForm.reset({
						decision: 'APPROVE',
						comments: '',
					});
				}
				this.isSubmitting = false;
			});
	}

	// Get CSS class for status badge
	getStatusClass(status: ApplicationStatus): string {
		switch (status) {
			case ApplicationStatus.DRAFT:
				return 'draft';
			case ApplicationStatus.SUBMITTED:
				return 'pending';
			case ApplicationStatus.UNDER_REVIEW_LP:
			case ApplicationStatus.UNDER_REVIEW_MANAGER:
			case ApplicationStatus.UNDER_REVIEW_COO:
				return 'under-review';
			case ApplicationStatus.APPROVED_BY_LP:
			case ApplicationStatus.APPROVED_BY_MANAGER:
			case ApplicationStatus.APPROVED:
				return 'approved';
			case ApplicationStatus.RETURNED_BY_LP:
			case ApplicationStatus.RETURNED_BY_MANAGER:
			case ApplicationStatus.RETURNED_BY_COO:
				return 'returned';
			case ApplicationStatus.REJECTED:
				return 'rejected';
			default:
				return '';
		}
	}

	// Get translated status label
	getStatusLabel(status: ApplicationStatus): string {
		switch (status) {
			case ApplicationStatus.DRAFT:
				return 'draft';
			case ApplicationStatus.SUBMITTED:
				return 'submitted';
			case ApplicationStatus.UNDER_REVIEW_LP:
				return 'under_review_lp';
			case ApplicationStatus.RETURNED_BY_LP:
				return 'returned_by_lp';
			case ApplicationStatus.APPROVED_BY_LP:
				return 'approved_by_lp';
			case ApplicationStatus.UNDER_REVIEW_MANAGER:
				return 'under_review_manager';
			case ApplicationStatus.RETURNED_BY_MANAGER:
				return 'returned_by_manager';
			case ApplicationStatus.APPROVED_BY_MANAGER:
				return 'approved_by_manager';
			case ApplicationStatus.UNDER_REVIEW_COO:
				return 'under_review_coo';
			case ApplicationStatus.RETURNED_BY_COO:
				return 'returned_by_coo';
			case ApplicationStatus.APPROVED:
				return 'approved';
			case ApplicationStatus.REJECTED:
				return 'rejected';
			default:
				return 'unknown';
		}
	}

	// Get status display text
	getStatusDisplayText(
		status: ApplicationStatus | ApplicationStatusType
	): string {
		switch (status) {
			case ApplicationStatus.DRAFT:
				return 'Draft';
			case ApplicationStatus.SUBMITTED:
				return 'Submitted';
			case ApplicationStatus.UNDER_REVIEW_LP:
				return 'Under Review (Land & Planning)';
			case ApplicationStatus.RETURNED_BY_LP:
				return 'Returned by Land & Planning';
			case ApplicationStatus.APPROVED_BY_LP:
				return 'Approved by Land & Planning';
			case ApplicationStatus.UNDER_REVIEW_MANAGER:
				return 'Under Review (Manager)';
			case ApplicationStatus.RETURNED_BY_MANAGER:
				return 'Returned by Manager';
			case ApplicationStatus.APPROVED_BY_MANAGER:
				return 'Approved by Manager';
			case ApplicationStatus.UNDER_REVIEW_COO:
				return 'Under Review (COO)';
			case ApplicationStatus.RETURNED_BY_COO:
				return 'Returned by COO';
			case ApplicationStatus.APPROVED:
				return 'Approved';
			case ApplicationStatus.REJECTED:
				return 'Rejected';
			default:
				return 'Unknown';
		}
	}

	// Get role-specific title for the review section
	getRoleSpecificTitle(): string {
		if (this.isLPSpecialist) {
			return 'Land & Planning Specialist Review';
		} else if (this.isAgricultureManager) {
			return 'Agriculture Relations Manager Review';
		} else if (this.isCOO) {
			return 'Chief Operating Officer Final Review';
		}
		return 'Application Review';
	}

	// Get decision display text
	getDecisionDisplayText(decision: string): string {
		switch (decision) {
			case 'APPROVE':
				return 'Approved';
			case 'REJECT':
				return 'Rejected';
			case 'RETURN':
				return 'Returned for Revision';
			default:
				return decision;
		}
	}

	// Get decision options based on role
	getDecisionOptions(): { value: string; label: string }[] {
		const baseOptions = [
			{ value: 'APPROVE', label: 'Approve' },
			{ value: 'RETURN', label: 'Return for Revision' },
		];

		// Only COO can reject applications
		if (this.isCOO) {
			baseOptions.push({ value: 'REJECT', label: 'Reject Application' });
		}

		return baseOptions;
	}

	// Determine if a section should be visible
	canSeeSection(section: string): boolean {
		// If application is not loaded yet, don't show any sections
		if (!this.application) {
			return false;
		}

		console.log(`Checking visibility for section: ${section}`);

		// Core sections are always visible
		if (['summary', 'applicant', 'location'].includes(section)) {
			return true;
		}

		// For documents section
		if (section === 'documents') {
			// Only show if documents exist
			return (
				Array.isArray(this.application.documents) &&
				this.application.documents.length > 0
			);
		}

		// For reviews section
		if (section === 'reviews') {
			// Only show if reviews exist
			return (
				Array.isArray(this.application.reviews) &&
				this.application.reviews.length > 0
			);
		}

		// For role-specific sections
		if (section === 'lp-checklist') {
			return (
				this.isLPSpecialist &&
				(this.application.status === ApplicationStatus.SUBMITTED ||
					this.application.status === ApplicationStatus.UNDER_REVIEW_LP)
			);
		}

		if (section === 'manager-checklist') {
			return (
				this.isAgricultureManager &&
				(this.application.status === ApplicationStatus.APPROVED_BY_LP ||
					this.application.status === ApplicationStatus.UNDER_REVIEW_MANAGER)
			);
		}

		if (section === 'coo-checklist') {
			return (
				this.isCOO &&
				(this.application.status === ApplicationStatus.APPROVED_BY_MANAGER ||
					this.application.status === ApplicationStatus.UNDER_REVIEW_COO)
			);
		}

		return false;
	}

	goBack(): void {
		this.router.navigate(['/application']);
	}

	logout(): void {
		this.authService.logout();
		this.router.navigate(['/auth/login']);
	}

	handleActionStarted(message: string): void {
		this.isLoading = true;
		this.successMessage = '';
		this.errorMessage = '';
		console.log('Workflow action started:', message);
	}

	handleActionCompleted(updatedApplication: Application): void {
		this.isLoading = false;
		this.application = updatedApplication;
		this.successMessage = 'Action completed successfully';
		this.updateUserPermissions();
		console.log(
			'Workflow action completed, application updated:',
			updatedApplication
		);

		// Show success message briefly before navigation
		setTimeout(() => {
			// Navigate to applications list
			this.router.navigate(['/applications']);
		}, 1500); // Wait 1.5 seconds to show the success message
	}

	handleActionFailed(error: string): void {
		this.isLoading = false;
		this.errorMessage = error;
		console.error('Workflow action failed:', error);
	}
}
