import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Application, ApplicationStatus } from '../../models/application.model';
import {
  ApplicationService,
  ApplicationRecord,
  TaskItem,
} from '../../services/application.service';
import { AuthService } from '../../../auth/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
})
export class ApplicationListComponent implements OnInit {
  applications: ApplicationRecord[] = [];
  filteredApplications: ApplicationRecord[] = [];
  userTasks: TaskItem[] = [];
  isLoading: boolean = false;

  // Make Math available to the template
  Math = Math;

  // Make ApplicationStatus available to the template
  ApplicationStatus = ApplicationStatus;

  // User role from auth service
  currentUserRole: string = 'Applicant';
  currentUserName: string = '';

  // Filter options
  statusFilter: string = 'ALL';
  searchTerm: string = '';
  dateFilter: 'newest' | 'oldest' = 'newest';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  // Status display mapping
  statusDisplayMap: { [key: string]: string } = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    PENDING_LP_REVIEW: 'Pending LP Review',
    APPROVED_BY_LP: 'Approved by LP',
    REJECTED_BY_LP: 'Rejected by LP',
    PENDING_AGRICULTURE_REVIEW: 'Pending Agriculture Review',
    APPROVED_BY_AGRICULTURE: 'Approved by Agriculture',
    REJECTED_BY_AGRICULTURE: 'Rejected by Agriculture',
    PENDING_COO_REVIEW: 'Pending COO Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUserInfo();
    this.loadApplications();
  }

  getCurrentUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserRole = currentUser.role;
      this.currentUserName = currentUser.name || currentUser.username;
      console.log(`User authenticated as ${this.currentUserRole}: ${this.currentUserName}`);
    }
  }

  loadApplications(): void {
    this.isLoading = true;

    // Si el usuario es un revisador (LP Specialist, Agriculture Manager, COO), cargar solo sus aplicaciones asignadas
    if (['LPSpecialist', 'Manager', 'COO'].includes(this.currentUserRole)) {
      console.log(`Loading assigned applications for role: ${this.currentUserRole}`);
      this.loadAssignedApplications();
    } else {
      // Para solicitantes u otros usuarios, cargar todas las aplicaciones
      this.applicationService
        .getApplications()
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: applications => {
            this.applications = applications;
            this.applyFilters();
            // Also load tasks for the current user
            this.loadUserTasks();
          },
          error: error => {
            console.error('Error loading applications', error);
          },
        });
    }
  }

  loadAssignedApplications(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log(
      `Fetching applications assigned to: ${currentUser?.name || currentUser?.username} (${
        this.currentUserRole
      })`
    );

    this.applicationService
      .getAssignedApplications(this.currentUserRole)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: applications => {
          console.log(
            `Loaded ${applications.length} assigned applications for ${this.currentUserRole}`
          );
          this.applications = applications;
          this.applyFilters();
          // Also load tasks for the current user
          this.loadUserTasks();
        },
        error: error => {
          console.error('Error loading assigned applications', error);
        },
      });
  }

  loadUserTasks(): void {
    this.applicationService.getUserTasks().subscribe({
      next: tasks => {
        this.userTasks = tasks;
      },
      error: error => {
        console.error('Error loading user tasks', error);
      },
    });
  }

  createNewApplication(): void {
    this.router.navigate(['/application/new']);
  }

  viewApplication(id: string): void {
    this.router.navigate(['/application', id]);
  }

  editApplication(id: string): void {
    this.router.navigate(['/application/edit', id]);
  }

  deleteApplication(id: string): void {
    if (confirm('Are you sure you want to delete this application?')) {
      // In the real implementation, call the API to delete
      this.applications = this.applications.filter(app => app.id !== id);
      this.applyFilters();
    }
  }

  reviewApplication(id: string): void {
    // Navigate to the appropriate review page based on user role
    this.router.navigate(['/application/detail', id]);
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    // Filter by status if not 'ALL'
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        app =>
          app.applicationNumber.toLowerCase().includes(term) ||
          app.applicantName.toLowerCase().includes(term)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.submissionDate || a.lastUpdated || '').getTime();
      const dateB = new Date(b.submissionDate || b.lastUpdated || '').getTime();
      return this.dateFilter === 'newest' ? dateB - dateA : dateA - dateB;
    });

    this.filteredApplications = filtered;
    this.totalItems = filtered.length;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onDateFilterChange(filter: 'newest' | 'oldest'): void {
    this.dateFilter = filter;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
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

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get displayedApplications(): ApplicationRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredApplications.slice(start, end);
  }

  // Helper method to get the count of applications awaiting user's review
  getAssignedApplicationsCount(): number {
    return this.applications.length;
  }

  // Helper method to determine if application can be reviewed by current user
  canReviewApplication(app: ApplicationRecord): boolean {
    if (this.currentUserRole === 'LPSpecialist' && app.status === 'PENDING_LP_REVIEW') {
      return true;
    }
    if (this.currentUserRole === 'Manager' && app.status === 'PENDING_AGRICULTURE_REVIEW') {
      return true;
    }
    if (this.currentUserRole === 'COO' && app.status === 'PENDING_COO_REVIEW') {
      return true;
    }
    return false;
  }

  getTaskForApplication(applicationId: string): TaskItem | undefined {
    return this.userTasks.find(task => task.applicationId === applicationId);
  }
}
