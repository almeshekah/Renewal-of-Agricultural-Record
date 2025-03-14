import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Application, ApplicationStatus, Review } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit {
  application: Application;
  applicationId: number;
  currentStep: number = 0;
  isLoading: boolean = false;
  statusMessage: string = '';
  errorMessage: string = '';

  readonly workflowSteps = [
    { label: 'Submit Application', status: ApplicationStatus.SUBMITTED },
    { label: 'L&P Specialist Review', status: ApplicationStatus.PENDING_LP_REVIEW },
    { label: 'L&P Specialist Decision', status: ApplicationStatus.APPROVED_BY_LP },
    { label: 'Agriculture Manager Review', status: ApplicationStatus.PENDING_AGRICULTURE_REVIEW },
    { label: 'Agriculture Manager Decision', status: ApplicationStatus.APPROVED_BY_AGRICULTURE },
    { label: 'COO Review', status: ApplicationStatus.PENDING_COO_REVIEW },
    { label: 'Final Decision', status: ApplicationStatus.APPROVED },
  ];

  // User information for test workflows
  readonly userInfo = {
    lpSpecialist: { role: 'LP_SPECIALIST' as const, id: '101', name: 'Mohammed Al Qahtani' },
    manager: { role: 'AGRICULTURE_MANAGER' as const, id: '102', name: 'Saeed Al Ghamdi' },
    coo: { role: 'COO' as const, id: '103', name: 'Abdullah Al Otaibi' },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.applicationId = parseInt(id, 10);
        this.loadApplication();
      } else {
        this.errorMessage = 'Application ID not found';
      }
    });
  }

  loadApplication(): void {
    this.isLoading = true;
    this.statusMessage = 'Loading application details...';
    this.errorMessage = '';

    this.applicationService.getApplication(this.applicationId).subscribe(
      application => {
        this.application = application;
        this.determineCurrentStep();
        this.isLoading = false;
        this.statusMessage = '';
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error loading application: ${error.message}`;
      }
    );
  }

  determineCurrentStep(): void {
    // Find the step that matches the current application status
    const stepIndex = this.workflowSteps.findIndex(step => step.status === this.application.status);
    this.currentStep = stepIndex >= 0 ? stepIndex : 0;
  }

  goBack(): void {
    this.router.navigate(['/application']);
  }

  getStepClass(index: number): string {
    if (index < this.currentStep) {
      return 'completed';
    } else if (index === this.currentStep) {
      return 'active';
    } else {
      return 'pending';
    }
  }

  getStatusClass(status: ApplicationStatus | string): string {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'status-draft';
      case ApplicationStatus.SUBMITTED:
        return 'status-submitted';
      case ApplicationStatus.IN_REVIEW:
      case ApplicationStatus.PENDING_LP_REVIEW:
      case ApplicationStatus.PENDING_AGRICULTURE_REVIEW:
      case ApplicationStatus.PENDING_COO_REVIEW:
        return 'status-in-review';
      case ApplicationStatus.APPROVED:
      case ApplicationStatus.APPROVED_BY_LP:
      case ApplicationStatus.APPROVED_BY_AGRICULTURE:
        return 'status-approved';
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.REJECTED_BY_LP:
      case ApplicationStatus.REJECTED_BY_AGRICULTURE:
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusDisplayValue(status: ApplicationStatus | string): string {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'Draft';
      case ApplicationStatus.SUBMITTED:
        return 'Submitted';
      case ApplicationStatus.IN_REVIEW:
        return 'In Review';
      case ApplicationStatus.PENDING_LP_REVIEW:
        return 'Pending L&P Review';
      case ApplicationStatus.APPROVED_BY_LP:
        return 'Approved by L&P';
      case ApplicationStatus.REJECTED_BY_LP:
        return 'Rejected by L&P';
      case ApplicationStatus.PENDING_AGRICULTURE_REVIEW:
        return 'Pending Agriculture Review';
      case ApplicationStatus.APPROVED_BY_AGRICULTURE:
        return 'Approved by Agriculture';
      case ApplicationStatus.REJECTED_BY_AGRICULTURE:
        return 'Rejected by Agriculture';
      case ApplicationStatus.PENDING_COO_REVIEW:
        return 'Pending COO Review';
      case ApplicationStatus.APPROVED:
        return 'Approved';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      default:
        return status.toString();
    }
  }

  startLPSpecialistReview(): void {
    this.isLoading = true;
    this.statusMessage = 'Sending to L&P Specialist review...';

    this.applicationService
      .updateApplication(this.applicationId, {
        status: ApplicationStatus.PENDING_LP_REVIEW,
      })
      .subscribe(
        updatedApp => {
          this.application = updatedApp;
          this.currentStep = 1; // Move to the next step
          this.isLoading = false;
          this.statusMessage = 'Application sent to L&P Specialist for review';
        },
        error => {
          this.isLoading = false;
          this.errorMessage = `Error updating application: ${error.message}`;
        }
      );
  }

  approveLPSpecialist(): void {
    this.isLoading = true;
    this.statusMessage = 'Processing L&P Specialist approval...';

    const review: Review = {
      reviewerId: this.userInfo.lpSpecialist.id,
      reviewerName: this.userInfo.lpSpecialist.name,
      reviewerRole: this.userInfo.lpSpecialist.role,
      decision: 'APPROVE',
      comments:
        'All land planning requirements have been met. The application complies with zoning regulations and environmental standards.',
      timestamp: new Date().toISOString(),
    };

    this.applicationService.submitReview(this.applicationId, review).subscribe(
      updatedApp => {
        this.application = updatedApp;
        this.currentStep = 2; // Move to L&P Specialist Decision step
        this.isLoading = false;
        this.statusMessage = 'L&P Specialist approved the application';
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error submitting review: ${error.message}`;
      }
    );
  }

  startManagerReview(): void {
    this.isLoading = true;
    this.statusMessage = 'Sending to Agriculture Manager review...';

    this.applicationService
      .updateApplication(this.applicationId, {
        status: ApplicationStatus.PENDING_AGRICULTURE_REVIEW,
      })
      .subscribe(
        updatedApp => {
          this.application = updatedApp;
          this.currentStep = 3; // Move to the next step
          this.isLoading = false;
          this.statusMessage = 'Application sent to Agriculture Manager for review';
        },
        error => {
          this.isLoading = false;
          this.errorMessage = `Error updating application: ${error.message}`;
        }
      );
  }

  approveManager(): void {
    this.isLoading = true;
    this.statusMessage = 'Processing Agriculture Manager approval...';

    const review: Review = {
      reviewerId: this.userInfo.manager.id,
      reviewerName: this.userInfo.manager.name,
      reviewerRole: this.userInfo.manager.role,
      decision: 'APPROVE',
      comments:
        'The application meets all agricultural requirements and standards. Approved for continuing to next phase.',
      timestamp: new Date().toISOString(),
    };

    this.applicationService.submitReview(this.applicationId, review).subscribe(
      updatedApp => {
        this.application = updatedApp;
        this.currentStep = 4; // Move to Agriculture Manager Decision step
        this.isLoading = false;
        this.statusMessage = 'Agriculture Manager approved the application';
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error submitting review: ${error.message}`;
      }
    );
  }

  startCOOReview(): void {
    this.isLoading = true;
    this.statusMessage = 'Sending to COO review...';

    this.applicationService
      .updateApplication(this.applicationId, {
        status: ApplicationStatus.PENDING_COO_REVIEW,
      })
      .subscribe(
        updatedApp => {
          this.application = updatedApp;
          this.currentStep = 5; // Move to the next step
          this.isLoading = false;
          this.statusMessage = 'Application sent to COO for final review';
        },
        error => {
          this.isLoading = false;
          this.errorMessage = `Error updating application: ${error.message}`;
        }
      );
  }

  approveCOO(): void {
    this.isLoading = true;
    this.statusMessage = 'Processing COO approval...';

    const review: Review = {
      reviewerId: this.userInfo.coo.id,
      reviewerName: this.userInfo.coo.name,
      reviewerRole: this.userInfo.coo.role,
      decision: 'APPROVE',
      comments:
        'The application has been thoroughly reviewed and meets all organizational requirements and standards. Final approval granted.',
      timestamp: new Date().toISOString(),
    };

    this.applicationService.submitReview(this.applicationId, review).subscribe(
      updatedApp => {
        this.application = updatedApp;
        this.currentStep = 6; // Move to Final Decision step
        this.isLoading = false;
        this.statusMessage = 'COO approved the application. Process completed successfully!';
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error submitting review: ${error.message}`;
      }
    );
  }

  rejectCOO(): void {
    this.isLoading = true;
    this.statusMessage = 'Processing COO rejection...';

    const review: Review = {
      reviewerId: this.userInfo.coo.id,
      reviewerName: this.userInfo.coo.name,
      reviewerRole: this.userInfo.coo.role,
      decision: 'REJECT',
      comments:
        'The application cannot be approved due to significant issues that do not meet organizational standards.',
      timestamp: new Date().toISOString(),
    };

    this.applicationService.submitReview(this.applicationId, review).subscribe(
      updatedApp => {
        this.application = updatedApp;
        this.isLoading = false;
        this.statusMessage = 'COO rejected the application. Process terminated.';
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error submitting review: ${error.message}`;
      }
    );
  }

  returnApplication(role: 'LP_SPECIALIST' | 'AGRICULTURE_MANAGER' | 'COO'): void {
    this.isLoading = true;
    this.statusMessage = 'Processing return request...';

    let reviewer: { id: string; name: string; role: string };
    let newStatus: ApplicationStatus;

    switch (role) {
      case 'LP_SPECIALIST':
        reviewer = this.userInfo.lpSpecialist;
        newStatus = ApplicationStatus.SUBMITTED;
        break;
      case 'AGRICULTURE_MANAGER':
        reviewer = this.userInfo.manager;
        newStatus = ApplicationStatus.APPROVED_BY_LP;
        break;
      case 'COO':
        reviewer = this.userInfo.coo;
        newStatus = ApplicationStatus.APPROVED_BY_AGRICULTURE;
        break;
    }

    const review: Review = {
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      reviewerRole: reviewer.role,
      decision: 'REQUEST_CHANGES',
      comments:
        'The application requires revisions before it can be approved. Please update and resubmit.',
      timestamp: new Date().toISOString(),
    };

    this.applicationService.submitReview(this.applicationId, review).subscribe(
      () => {
        // After adding the review, update the status
        this.applicationService
          .updateApplication(this.applicationId, { status: newStatus })
          .subscribe(
            updatedApp => {
              this.application = updatedApp;
              this.determineCurrentStep();
              this.isLoading = false;
              this.statusMessage = 'Application returned for revision';
            },
            error => {
              this.isLoading = false;
              this.errorMessage = `Error updating application: ${error.message}`;
            }
          );
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error submitting review: ${error.message}`;
      }
    );
  }

  rejectApplication(role: 'LP_SPECIALIST'): void {
    this.isLoading = true;
    this.statusMessage = 'Processing rejection...';

    const review: Review = {
      reviewerId: this.userInfo.lpSpecialist.id,
      reviewerName: this.userInfo.lpSpecialist.name,
      reviewerRole: this.userInfo.lpSpecialist.role,
      decision: 'REJECT',
      comments: 'The application does not meet required standards and is rejected.',
      timestamp: new Date().toISOString(),
    };

    this.applicationService.submitReview(this.applicationId, review).subscribe(
      updatedApp => {
        this.application = updatedApp;
        this.isLoading = false;
        this.statusMessage = 'Application has been rejected by L&P Specialist';
      },
      error => {
        this.isLoading = false;
        this.errorMessage = `Error submitting review: ${error.message}`;
      }
    );
  }
}
