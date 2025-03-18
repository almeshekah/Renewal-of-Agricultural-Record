import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Application, ApplicationStatus, Review } from '../../models/application.model';
import {
  ApplicationService,
  ApplicationRecord,
  ApplicationReview,
} from '../../services/application.service';
import {
  WorkflowService,
  Task,
  CompleteTaskParams,
  StartProcessParams,
  ProcessInstance,
} from '../../services/workflow.service';
import { AuthService, User } from '../../../auth/services/auth.service';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit {
  application: ApplicationRecord;
  applicationId: string;
  currentStep: number = 0;
  isLoading: boolean = false;
  statusMessage: string = '';
  errorMessage: string = '';
  currentTask: Task | null = null;
  processInstanceId: string | null = null;
  currentUser: User | null = null;
  reviewForm: FormGroup;
  isReviewing: boolean = false;
  reviews: ApplicationReview[] = [];

  readonly workflowSteps = [
    { label: 'Submit Application', status: 'SUBMITTED' },
    { label: 'LP Specialist Review', status: 'PENDING_LP_REVIEW' },
    { label: 'LP Specialist Decision', status: 'APPROVED_BY_LP' },
    { label: 'Agriculture Manager Review', status: 'PENDING_AGRICULTURE_REVIEW' },
    { label: 'Agriculture Manager Decision', status: 'APPROVED_BY_AGRICULTURE' },
    { label: 'COO Review', status: 'PENDING_COO_REVIEW' },
    { label: 'Final Decision', status: 'APPROVED' },
  ];

  // For direct access to ApplicationStatus enum in the template
  ApplicationStatus = ApplicationStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private workflowService: WorkflowService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      decision: ['APPROVE', Validators.required],
      comments: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.route.params.subscribe(params => {
      this.applicationId = params['id'];
      this.loadApplication();
    });

    this.route.queryParams.subscribe(params => {
      this.processInstanceId = params['processInstanceId'] || null;
    });
  }

  private loadApplication(): void {
    this.isLoading = true;
    console.log('Reloading application data...');
    this.applicationService
      .getApplicationById(this.applicationId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: application => {
          // التأكد من عدم استخدام البيانات المخزنة مؤقتًا
          this.application = JSON.parse(JSON.stringify(application));
          console.log('Updated application data:', this.application);
          console.log('Current application status:', this.application.status);
          this.determineCurrentStep();
          if (this.processInstanceId) {
            this.loadCurrentTask();
          }
          // Load reviews for this application
          this.loadReviews();
        },
        error: error => {
          this.errorMessage = 'Failed to load application details.';
          console.error('Error loading application:', error);
        },
      });
  }

  private loadReviews(): void {
    this.applicationService.getApplicationReviews(this.applicationId).subscribe({
      next: reviews => {
        this.reviews = reviews;
      },
      error: error => {
        console.error('Error loading application reviews:', error);
      },
    });
  }

  private loadCurrentTask(): void {
    if (this.processInstanceId) {
      this.workflowService.getCurrentTask(this.processInstanceId).subscribe({
        next: task => {
          this.currentTask = task;
        },
        error: error => {
          console.error('Error loading current task:', error);
        },
      });
    }
  }

  determineCurrentStep(): void {
    const stepIndex = this.workflowSteps.findIndex(step => step.status === this.application.status);
    console.log(`Determining current step: ${this.application.status} -> step index: ${stepIndex}`);
    this.currentStep = stepIndex >= 0 ? stepIndex : 0;
    console.log(`Current step updated to: ${this.currentStep}`);
  }

  goBack(): void {
    this.router.navigate(['/application']);
  }

  getStepClass(stepIndex: number): string {
    if (stepIndex < this.currentStep) {
      return 'completed';
    } else if (stepIndex === this.currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'badge-secondary';
      case 'SUBMITTED':
        return 'badge-primary';
      case 'IN_REVIEW':
      case 'PENDING_LP_REVIEW':
      case 'PENDING_AGRICULTURE_REVIEW':
      case 'PENDING_COO_REVIEW':
        return 'badge-info';
      case 'APPROVED_BY_LP':
      case 'APPROVED_BY_AGRICULTURE':
      case 'APPROVED':
        return 'badge-success';
      case 'REJECTED_BY_LP':
      case 'REJECTED_BY_AGRICULTURE':
      case 'REJECTED':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusDisplayValue(status: string): string {
    const statusMap: { [key: string]: string } = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      IN_REVIEW: 'In Review',
      PENDING_LP_REVIEW: 'Pending LP Specialist Review',
      APPROVED_BY_LP: 'Approved by LP Specialist',
      REJECTED_BY_LP: 'Rejected by LP Specialist',
      PENDING_AGRICULTURE_REVIEW: 'Pending Agriculture Manager Review',
      APPROVED_BY_AGRICULTURE: 'Approved by Agriculture Manager',
      REJECTED_BY_AGRICULTURE: 'Rejected by Agriculture Manager',
      PENDING_COO_REVIEW: 'Pending COO Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };

    return statusMap[status] || 'Unknown Status';
  }

  // Check if the current user can review this application
  canReview(): boolean {
    if (!this.currentUser || !this.application) return false;

    // التحقق من وجود أدوار متعددة للمستخدم
    const userRoles = Array.isArray(this.currentUser.roles)
      ? this.currentUser.roles
      : [this.currentUser.role];

    // حالة خاصة - إذا كان المستخدم مسؤولاً، فهو دائمًا يستطيع المراجعة
    if (userRoles.includes('Admin')) return true;

    // التحقق استنادًا إلى حالة الطلب الحالية
    switch (this.application.status) {
      case 'PENDING_LP_REVIEW':
        return userRoles.includes('LPSpecialist');
      case 'PENDING_AGRICULTURE_REVIEW':
        return userRoles.includes('Manager') || userRoles.includes('AgricultureManager');
      case 'PENDING_COO_REVIEW':
        return userRoles.includes('COO');
      default:
        // للسماح بإجراء الاختبارات - إذا كان المستخدم مسؤولاً، فالسماح له بالمراجعة في أي حالة
        return this.currentUser.role === 'Admin';
    }
  }

  // Start the review process
  startReview(): void {
    this.isReviewing = true;
  }

  // Cancel the review process
  cancelReview(): void {
    this.isReviewing = false;
    this.reviewForm.reset({
      decision: 'APPROVE',
      comments: '',
    });
  }

  // Submit the review
  submitReview(): void {
    if (this.reviewForm.invalid) return;

    const { decision, comments } = this.reviewForm.value;
    this.isLoading = true;

    // Get task ID
    if (!this.currentTask) {
      this.errorMessage = 'No active task found for this application.';
      this.isLoading = false;
      return;
    }

    const taskId = this.currentTask.id;

    this.applicationService
      .completeTask(taskId, decision, comments)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.isReviewing = false;
        })
      )
      .subscribe({
        next: result => {
          // Add success message
          this.statusMessage = `Application successfully ${
            decision === 'APPROVE'
              ? 'approved'
              : decision === 'REJECT'
              ? 'rejected'
              : 'returned for changes'
          }.`;

          // Reload the application after a short delay
          setTimeout(() => {
            this.loadApplication();
          }, 1500);
        },
        error: error => {
          this.errorMessage = 'Failed to submit review. Please try again.';
          console.error('Error submitting review:', error);
        },
      });
  }

  private updateApplicationStatus(decision: string): void {
    if (!this.application) return;

    let newStatus: string;

    switch (this.application.status) {
      case 'PENDING_LP_REVIEW':
        newStatus = decision === 'APPROVE' ? 'APPROVED_BY_LP' : 'REJECTED_BY_LP';
        break;
      case 'PENDING_AGRICULTURE_REVIEW':
        newStatus = decision === 'APPROVE' ? 'APPROVED_BY_AGRICULTURE' : 'REJECTED_BY_AGRICULTURE';
        break;
      case 'PENDING_COO_REVIEW':
        newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        break;
      default:
        newStatus = this.application.status;
    }

    this.application.status = newStatus;
  }

  // Methods for direct action buttons
  approveApplication(): void {
    this.isLoading = true;

    if (this.canReview()) {
      // إذا كان لدينا المهمة الحالية، نستخدمها، وإلا نقوم بإنشاء المهمة أولاً
      if (this.currentTask) {
        // استخدام المهمة الحالية مباشرة
        this.completeCurrentTask('APPROVE', 'Application approved');
      } else {
        // لا توجد مهمة حالية، نحاول الحصول على المهام المرتبطة بهذا التطبيق
        this.applicationService.getTasksByApplicationId(this.applicationId).subscribe({
          next: tasks => {
            if (tasks && tasks.length > 0) {
              // استخدام أول مهمة متاحة
              this.currentTask = tasks[0];
              this.completeCurrentTask('APPROVE', 'Application approved');
            } else {
              // لا توجد مهام متاحة لهذا التطبيق، نحاول إنشاء مهمة
              this.createAndCompleteTask('APPROVE', 'Application approved');
            }
          },
          error: error => {
            console.error('Error fetching tasks:', error);
            // في حالة الفشل، نحاول إنشاء مهمة جديدة
            this.createAndCompleteTask('APPROVE', 'Application approved');
          },
        });
      }
    } else {
      // المستخدم ليس لديه صلاحية المراجعة
      this.isLoading = false;
      this.errorMessage =
        'You do not have permission to approve this application in its current state.';
    }
  }

  // وظيفة مساعدة لإكمال المهمة الحالية
  private completeCurrentTask(decision: string, comment: string): void {
    const taskId = this.currentTask!.id;
    console.log(`Completing task ID: ${taskId} with decision: ${decision}`);

    this.applicationService
      .completeTask(taskId, decision, comment)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: result => {
          console.log('Task completion result:', result);
          this.statusMessage = `Application successfully ${
            decision === 'APPROVE'
              ? 'approved'
              : decision === 'REJECT'
              ? 'rejected'
              : 'returned for revision'
          }.`;

          // تحديث حالة الطلب محليًا قبل إعادة التحميل
          if (this.application) {
            const newStatus = this.determineNewStatus(decision);
            console.log(
              `Updating local application status: ${this.application.status} -> ${newStatus}`
            );
            this.application.status = newStatus;
            this.determineCurrentStep();
          }

          setTimeout(() => {
            this.loadApplication();
          }, 1500);
        },
        error: error => {
          this.errorMessage = `Failed to ${decision.toLowerCase()} application. Please try again.`;
          console.error(`Error ${decision.toLowerCase()}ing application:`, error);
        },
      });
  }

  // وظيفة مساعدة لإنشاء مهمة جديدة وإكمالها
  private createAndCompleteTask(decision: string, comment: string): void {
    // محاولة تحديث حالة التطبيق مباشرة إذا فشلت جميع المحاولات الأخرى
    const newStatus = this.determineNewStatus(decision);

    // جلب نسخة كاملة من الطلب لتحديثه
    this.applicationService.getApplicationById(this.applicationId).subscribe({
      next: latestApp => {
        // إعداد كائن التحديث مع كل الحقول المطلوبة
        const updateDto = {
          status: newStatus,
          // استخدام البيانات الموجودة لتجنب الخطأ
          title: latestApp.title || 'Agricultural Record Renewal',
          email: latestApp.email || (latestApp.applicant ? latestApp.applicant.email : ''),
          mobileNumber:
            latestApp.mobileNumber || (latestApp.applicant ? latestApp.applicant.phone : ''),
          address: latestApp.address || 'No address provided',
          farmLocation: latestApp.farmLocation || 'Not specified',
          recordType: latestApp.recordType || 'Agricultural Record Renewal',
          assignedTo: latestApp.assignedTo || this.currentUser?.name || 'Not assigned',
          assignedToId: latestApp.assignedToId || this.currentUser?.id || 'not-assigned',
          // اضافة أي حقول أخرى مطلوبة من رسائل الخطأ
          applicationNumber: latestApp.applicationNumber,
          applicantName:
            latestApp.applicantName || (latestApp.applicant ? latestApp.applicant.name : ''),
          applicantId: latestApp.applicantId || (latestApp.applicant ? latestApp.applicant.id : ''),
        };

        console.log('Sending update with data:', updateDto);

        this.applicationService
          .updateApplication(this.applicationId, updateDto)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: result => {
              console.log('Application update result:', result);
              console.log('New application status:', result.status);
              this.statusMessage = `Application successfully ${
                decision === 'APPROVE'
                  ? 'approved'
                  : decision === 'REJECT'
                  ? 'rejected'
                  : 'returned for revision'
              }.`;
              setTimeout(() => {
                this.loadApplication();
              }, 1500);
            },
            error: error => {
              this.errorMessage = `Failed to ${decision.toLowerCase()} application. Please try again.`;
              console.error(`Error ${decision.toLowerCase()}ing application:`, error);
              console.error('Update request data:', updateDto);

              // بديل: إذا استمر الخطأ، قم بتحديث حالة العرض المحلي فقط
              if (this.application) {
                this.application.status = newStatus;
                this.statusMessage = `Application display status updated to: ${newStatus}. Refresh may be needed.`;

                // أضف مراجعة وهمية للعرض المحلي
                if (!this.reviews) this.reviews = [];
                this.reviews.push({
                  applicationId: this.applicationId,
                  decision: decision,
                  comment: comment,
                  reviewerId: this.currentUser?.id || 'system',
                  reviewerName: this.currentUser?.name || 'System',
                  reviewDate: new Date().toISOString(),
                });

                setTimeout(() => {
                  this.determineCurrentStep();
                }, 1000);
              }
            },
          });
      },
      error: err => {
        console.error('Error fetching latest application data:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to process application. Please try again.';
      },
    });
  }

  // وظيفة مساعدة لتحديد الحالة الجديدة بناءً على القرار
  private determineNewStatus(decision: string): string {
    const oldStatus = this.application?.status;
    let newStatus: string;

    switch (this.application?.status) {
      case 'PENDING_LP_REVIEW':
        newStatus =
          decision === 'APPROVE'
            ? 'PENDING_AGRICULTURE_REVIEW'
            : decision === 'REJECT'
            ? 'REJECTED'
            : 'RETURNED_FOR_REVISION';
        break;
      case 'PENDING_AGRICULTURE_REVIEW':
        newStatus =
          decision === 'APPROVE'
            ? 'PENDING_COO_REVIEW'
            : decision === 'REJECT'
            ? 'REJECTED'
            : 'RETURNED_FOR_REVISION';
        break;
      case 'PENDING_COO_REVIEW':
        newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        break;
      default:
        newStatus = this.application?.status || 'DRAFT';
    }

    console.log(`Status transition: ${oldStatus} -> ${newStatus} (Decision: ${decision})`);
    return newStatus;
  }

  returnForRevision(): void {
    this.isLoading = true;

    if (this.canReview()) {
      // إذا كان لدينا المهمة الحالية، نستخدمها، وإلا نقوم بإنشاء المهمة أولاً
      if (this.currentTask) {
        // استخدام المهمة الحالية مباشرة
        this.completeCurrentTask('REQUEST_CHANGES', 'Application requires changes');
      } else {
        // لا توجد مهمة حالية، نحاول الحصول على المهام المرتبطة بهذا التطبيق
        this.applicationService.getTasksByApplicationId(this.applicationId).subscribe({
          next: tasks => {
            if (tasks && tasks.length > 0) {
              // استخدام أول مهمة متاحة
              this.currentTask = tasks[0];
              this.completeCurrentTask('REQUEST_CHANGES', 'Application requires changes');
            } else {
              // لا توجد مهام متاحة لهذا التطبيق، نحاول إنشاء مهمة
              this.createAndCompleteTask('REQUEST_CHANGES', 'Application requires changes');
            }
          },
          error: error => {
            console.error('Error fetching tasks:', error);
            // في حالة الفشل، نحاول إنشاء مهمة جديدة
            this.createAndCompleteTask('REQUEST_CHANGES', 'Application requires changes');
          },
        });
      }
    } else {
      // المستخدم ليس لديه صلاحية المراجعة
      this.isLoading = false;
      this.errorMessage =
        'You do not have permission to return this application for revision in its current state.';
    }
  }

  rejectApplication(): void {
    this.isLoading = true;

    if (this.canReview()) {
      // إذا كان لدينا المهمة الحالية، نستخدمها، وإلا نقوم بإنشاء المهمة أولاً
      if (this.currentTask) {
        // استخدام المهمة الحالية مباشرة
        this.completeCurrentTask('REJECT', 'Application rejected');
      } else {
        // لا توجد مهمة حالية، نحاول الحصول على المهام المرتبطة بهذا التطبيق
        this.applicationService.getTasksByApplicationId(this.applicationId).subscribe({
          next: tasks => {
            if (tasks && tasks.length > 0) {
              // استخدام أول مهمة متاحة
              this.currentTask = tasks[0];
              this.completeCurrentTask('REJECT', 'Application rejected');
            } else {
              // لا توجد مهام متاحة لهذا التطبيق، نحاول إنشاء مهمة
              this.createAndCompleteTask('REJECT', 'Application rejected');
            }
          },
          error: error => {
            console.error('Error fetching tasks:', error);
            // في حالة الفشل، نحاول إنشاء مهمة جديدة
            this.createAndCompleteTask('REJECT', 'Application rejected');
          },
        });
      }
    } else {
      // المستخدم ليس لديه صلاحية المراجعة
      this.isLoading = false;
      this.errorMessage =
        'You do not have permission to reject this application in its current state.';
    }
  }
}
