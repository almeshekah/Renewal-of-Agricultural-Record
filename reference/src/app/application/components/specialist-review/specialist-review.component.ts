import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { Application, ApplicationStatus } from '../../models/application.model';
import { NotificationService } from '../../../notification/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { CommandDispatcherService } from '../../../core/commands/command-dispatcher.service';
import { ReviewDecisionCommand } from '../../commands/review-decision.command';

@Component({
  selector: 'app-specialist-review',
  templateUrl: './specialist-review.component.html',
  styleUrls: ['./specialist-review.component.scss'],
})
export class SpecialistReviewComponent implements OnInit {
  applicationId: string;
  application: Application;
  reviewForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  loadingError: string = null;
  errorMessage: string = null;
  successMessage: string = null;

  // Constants for the component
  readonly ROLE = 'SPECIALIST';
  readonly USER_NAME = 'Test Specialist'; // Would come from auth service in a real app
  readonly USER_ID = '101'; // Would come from auth service in a real app

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private commandDispatcher: CommandDispatcherService
  ) {
    this.reviewForm = this.fb.group({
      decision: ['APPROVE', Validators.required],
      comments: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit() {
    this.applicationId = this.route.snapshot.paramMap.get('id');

    if (!this.applicationId) {
      this.router.navigate(['/applications']);
      return;
    }

    this.loadApplication();
  }

  loadApplication() {
    this.isLoading = true;
    this.loadingError = null;

    this.applicationService.getApplication(this.applicationId).subscribe(
      application => {
        this.application = application;
        this.isLoading = false;

        // Check if application is in the correct state for review
        if (!this.isReviewEligible()) {
          this.errorMessage = this.translateService.instant(
            'application.review.not_eligible_for_specialist_review'
          );
        }
      },
      error => {
        this.isLoading = false;
        this.loadingError = this.translateService.instant('application.error.loading');
        console.error('Error loading application:', error);
      }
    );
  }

  isReviewEligible(): boolean {
    // Specialist can only review applications that have been submitted
    return (
      this.application &&
      (this.application.status === ApplicationStatus.SUBMITTED ||
        this.application.status === ApplicationStatus.UNDER_REVIEW_LP)
    );
  }

  async submitReview(): Promise<void> {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key).markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const command = new ReviewDecisionCommand({
        applicationId: this.applicationId,
        decision: this.reviewForm.value.decision,
        comments: this.reviewForm.value.comments,
        reviewerRole: this.ROLE,
        reviewerName: this.USER_NAME,
        reviewerId: this.USER_ID,
      });

      // Dispatch command and await result
      const result = await this.commandDispatcher.dispatch(command);

      this.isSubmitting = false;

      if (result.isSuccess()) {
        this.successMessage = this.translateService.instant('application.review.success_message');
        this.notificationService.success(
          this.translateService.instant('application.review.success_title'),
          this.translateService.instant('application.review.success_message')
        );

        // Reload the application to show updated status
        setTimeout(() => {
          this.loadApplication();

          // Reset the form
          this.reviewForm.reset({
            decision: 'APPROVE',
            comments: '',
          });
        }, 1000);
      } else {
        this.errorMessage =
          result.message || this.translateService.instant('application.review.error_message');
        if (result.isValidationFailure() && result.errors && result.errors.length > 0) {
          // Display validation errors
          this.errorMessage = result.errors.join(', ');
        }
      }
    } catch (error) {
      this.isSubmitting = false;
      this.errorMessage = this.translateService.instant('application.review.error_message');
      console.error('Error submitting review:', error);
    }
  }

  onAction(action: 'APPROVE' | 'RETURN' | 'REJECT') {
    this.reviewForm.patchValue({ decision: action });
    this.submitReview();
  }

  getStatusClass(status: string): string {
    if (!status) {
      return '';
    }

    const statusStr = status.toString().toUpperCase();

    switch (statusStr) {
      case ApplicationStatus.DRAFT:
        return 'status-draft';
      case ApplicationStatus.SUBMITTED:
        return 'status-submitted';
      case ApplicationStatus.UNDER_REVIEW_LP:
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'status-in-review';
      case ApplicationStatus.RETURNED_BY_LP:
      case ApplicationStatus.RETURNED_BY_MANAGER:
      case ApplicationStatus.RETURNED_BY_COO:
        return 'status-returned';
      case ApplicationStatus.APPROVED:
        return 'status-approved';
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    if (!status) {
      return '';
    }

    const statusStr = status.toString().toUpperCase();

    switch (statusStr) {
      case ApplicationStatus.DRAFT:
        return 'DRAFT';
      case ApplicationStatus.SUBMITTED:
        return 'SUBMITTED';
      case ApplicationStatus.UNDER_REVIEW_LP:
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'IN_REVIEW';
      case ApplicationStatus.RETURNED_BY_LP:
      case ApplicationStatus.RETURNED_BY_MANAGER:
      case ApplicationStatus.RETURNED_BY_COO:
        return 'RETURNED';
      case ApplicationStatus.APPROVED:
        return 'APPROVED';
      case ApplicationStatus.REJECTED:
        return 'REJECTED';
      default:
        return statusStr;
    }
  }
}
