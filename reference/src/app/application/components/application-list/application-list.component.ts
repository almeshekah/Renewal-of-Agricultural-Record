import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Application,
  ApplicationStatus,
  ApplicationStatusType,
} from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
})
export class ApplicationListComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  currentUserRole: string = '';
  currentLang: string = '';
  Math = Math; // Make Math available to the template

  // Current user information
  currentUser: any = null;
  userName: string = '';
  userRole: string = '';

  // Filters
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedDateRange: string = '';
  showMyReviewsOnly: boolean = false;
  showManagerReviewOnly: boolean = false;
  showCOOReviewOnly: boolean = false;

  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedApplications: any[] = [];

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private translateService: TranslateService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current language
    this.currentLang = this.translateService.currentLang || 'en';

    // Get current user information
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userName = user.fullName || '';
        this.userRole = user.role || '';
        this.currentUserRole = user.role || '';
        console.log('Current user info:', this.userName, this.userRole);
      } else {
        // Default for development if no user is available
        this.userName = 'Guest User';
        this.userRole = 'Guest';
        this.currentUserRole = 'Guest';
      }

      // Load applications with role-based filtering
    this.loadApplications();
    });
  }

  loadApplications(): void {
    // This would typically be an API call
    // For now, we'll use a mock service or data
    this.applicationService.getApplications().subscribe(
      (data: any[]) => {
        // Apply role-based filtering
        this.applications = this.filterApplicationsByUserRole(data);
        this.filteredApplications = [...this.applications];
        this.sortApplications();
        this.updatePagination(); // Initialize pagination
      },
      error => {
        console.error('Error loading applications', error);
      }
    );
  }

  createNewApplication(): void {
    this.router.navigate(['/applications/new']);
  }

  viewApplication(application: any): void {
    // Navigate to workflow-test instead of application details
    this.router.navigate(['/applications/workflow-test']);
  }

  editApplication(application: any): void {
    event.stopPropagation();

    if (application.status === 'DRAFT') {
      this.router.navigate(['/applications', application.id, 'edit']);
    } else if (this.requiresReviewByCurrentUser(application)) {
      this.router.navigate(['/applications', application.id, 'review']);
    }
  }

  createApplication(): void {
    this.router.navigate(['/applications/new']);
  }

  onSearchChange(term: string): void {
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {
    // Reset special filters
    if (
      this.selectedStatus !== 'ALL' ||
      this.selectedDateRange ||
      (this.searchQuery && this.searchQuery.trim() !== '')
    ) {
      this.showManagerReviewOnly = false;
      this.showCOOReviewOnly = false;
    }

    this.filteredApplications = this.applications.filter(app => {
      // If manager review filter is active
      if (this.showManagerReviewOnly) {
        return (
          app.status === ApplicationStatus.UNDER_REVIEW_MANAGER ||
          app.status === 'UNDER_REVIEW_MANAGER'
        ); // Handle both enum and string
      }

      // If COO review filter is active
      if (this.showCOOReviewOnly) {
        return (
          app.status === ApplicationStatus.UNDER_REVIEW_COO || app.status === 'UNDER_REVIEW_COO'
        ); // Handle both enum and string
      }

      if (this.selectedStatus && this.selectedStatus !== 'ALL') {
        if (app.status !== this.selectedStatus) {
          return false;
        }
      }

      if (this.selectedDateRange) {
        const appDate = new Date(app.submissionDate);

        switch (this.selectedDateRange) {
          case 'TODAY':
            const today = new Date();
            return appDate.toDateString() === today.toDateString();
          case 'THIS_WEEK':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDate >= weekAgo;
          case 'THIS_MONTH':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return appDate >= monthAgo;
          case 'THIS_YEAR':
            const yearStart = new Date(new Date().getFullYear(), 0, 1);
            return appDate >= yearStart;
          default:
            return true;
        }
      }

      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        return (
          app.id.toString().includes(query) ||
          app.title.toLowerCase().includes(query) ||
          app.applicant.name.toLowerCase().includes(query)
        );
      }

      return true;
    });

    this.sortApplications();
    this.updatePagination();
  }

  sortApplications(): void {
    this.filteredApplications.sort((a, b) => {
      const dateA = new Date(a.submissionDate);
      const dateB = new Date(b.submissionDate);
      return dateB.getTime() - dateA.getTime();
    });
  }

  filterMyReviewItems(): void {
    this.showMyReviewsOnly = !this.showMyReviewsOnly;

    if (this.showMyReviewsOnly) {
      this.filteredApplications = this.applications.filter(app =>
        this.requiresReviewByCurrentUser(app)
      );
    } else {
      // Reset filters and show all applications
      this.selectedStatus = 'ALL';
      this.selectedDateRange = '';
      this.searchQuery = '';
      this.applyFilters();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getStatusClass(status: ApplicationStatus | ApplicationStatusType): string {
    if (!status) return '';

    const statusUpper = status.toString().toUpperCase();

    switch (statusUpper) {
      case ApplicationStatus.DRAFT:
        return 'status-draft';
      case ApplicationStatus.SUBMITTED:
        return 'status-pending';
      case ApplicationStatus.UNDER_REVIEW_LP:
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'status-in-review';
      case ApplicationStatus.APPROVED:
      case ApplicationStatus.APPROVED_BY_LP:
      case ApplicationStatus.APPROVED_BY_MANAGER:
        return 'status-approved';
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.RETURNED_BY_LP:
      case ApplicationStatus.RETURNED_BY_MANAGER:
      case ApplicationStatus.RETURNED_BY_COO:
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  getStatusDisplayText(status: ApplicationStatus | ApplicationStatusType): string {
    if (!status) return '';

    // Handle if status is an object
    if (typeof status === 'object') {
      return 'Pending';
    }

    // Convert to uppercase for consistent comparison
    const statusStr = status.toString().toUpperCase();

    // Handle special status values with specific translations
    switch (statusStr) {
      case ApplicationStatus.APPROVED_BY_LP:
        return 'LP Approved';
      case ApplicationStatus.RETURNED_BY_LP:
        return 'LP Returned';
      case ApplicationStatus.APPROVED_BY_MANAGER:
        return 'Manager Approved';
      case ApplicationStatus.RETURNED_BY_MANAGER:
        return 'Manager Returned';
      case ApplicationStatus.UNDER_REVIEW_LP:
        return 'LP Review';
      default:
        // Try to use the standard translation key format
        const translationKey = 'applications.status_values.' + status.toString().toLowerCase();
        const translation = this.translateService.instant(translationKey);

        // If the translation is the same as the key, it means no translation was found
        if (translation === translationKey) {
          // Fallback: Format the status value for display
          return status
            .toString()
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
        }

        return translation;
    }
  }

  // Get user-friendly role label for display
  getRoleLabel(): string {
    switch (this.currentUserRole) {
      case 'lp-specialist':
        return 'L&P Specialist';
      case 'agriculture-manager':
        return 'Agriculture Manager';
      case 'coo':
        return 'COO';
      default:
        return this.currentUserRole;
    }
  }

  /**
   * Checks if the application requires review by the current user based on their role
   * Note: Currently disabled per user request - no highlighting needed
   */
  requiresReviewByCurrentUser(application: Application): boolean {
    // Always return false to disable highlighting
    return false;

    /* Original implementation
    // Skip highlighting for application with ID 2
    if (application.id === 2) return false;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !application) return false;

    // Check if the application status matches the current user's role review status
    switch (currentUser.role) {
      case 'lp-specialist':
        return application.status === ApplicationStatus.UNDER_REVIEW_LP;
      case 'agriculture-manager':
        return application.status === ApplicationStatus.UNDER_REVIEW_MANAGER;
      case 'coo':
        return application.status === ApplicationStatus.UNDER_REVIEW_COO;
      default:
        return false;
    }
    */
  }

  /**
   * Switch between English and Arabic languages
   */
  switchLanguage(): void {
    // Toggle between English and Arabic
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translateService.use(this.currentLang);

    // Change document direction based on language
    const dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = this.currentLang;
  }

  // Pagination methods
  updatePagination(): void {
    this.totalItems = this.filteredApplications.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1; // Reset to first page on filter change
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    this.paginatedApplications = this.filteredApplications.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedItems();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedItems();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedItems();
    }
  }

  // Filter for applications requiring Manager review
  filterManagerReviewItems(): void {
    // Toggle the filter state
    this.showManagerReviewOnly = !this.showManagerReviewOnly;

    // If enabling this filter, disable other filters
    if (this.showManagerReviewOnly) {
      this.showCOOReviewOnly = false;
      this.showMyReviewsOnly = false;
      this.selectedStatus = 'ALL';
      this.selectedDateRange = '';
      this.searchQuery = '';
    }

    // Apply the filters
    this.applyFilters();
  }

  // Filter for applications requiring COO review
  filterCOOReviewItems(): void {
    // Toggle the filter state
    this.showCOOReviewOnly = !this.showCOOReviewOnly;

    // If enabling this filter, disable other filters
    if (this.showCOOReviewOnly) {
      this.showManagerReviewOnly = false;
      this.showMyReviewsOnly = false;
      this.selectedStatus = 'ALL';
      this.selectedDateRange = '';
      this.searchQuery = '';
    }

    // Apply the filters
    this.applyFilters();
  }

  // Filter applications based on the user's role
  filterApplicationsByUserRole(applications: Application[]): Application[] {
    // If no user or applicant role, show all applications
    if (
      !this.currentUser ||
      this.currentUserRole === 'applicant' ||
      this.currentUserRole === 'Guest'
    ) {
      return applications;
    }

    return applications.filter(app => {
      const status = app.status.toString();

      switch (this.currentUserRole) {
        case 'lp-specialist':
          // LP specialists should see applications that are:
          // - Under LP review
          // - Returned by LP
          // - Approved by LP (recently processed)
          return (
            status === 'UNDER_REVIEW_LP' ||
            status === 'RETURNED_BY_LP' ||
            status === 'APPROVED_BY_LP'
          );

        case 'agriculture-manager':
          // Agriculture managers should see applications that are:
          // - Approved by LP (ready for manager review)
          // - Under manager review
          // - Returned by manager
          // - Approved by manager (recently processed)
          return (
            status === 'APPROVED_BY_LP' ||
            status === 'UNDER_REVIEW_MANAGER' ||
            status === 'RETURNED_BY_MANAGER' ||
            status === 'APPROVED_BY_MANAGER'
          );

        case 'coo':
          // COO should see applications that are:
          // - Approved by manager (ready for COO review)
          // - Under COO review
          // - Returned by COO
          // - Approved (final approval)
          // - Rejected
          return (
            status === 'APPROVED_BY_MANAGER' ||
            status === 'UNDER_REVIEW_COO' ||
            status === 'RETURNED_BY_COO' ||
            status === 'APPROVED' ||
            status === 'REJECTED'
          );

        default:
          return true;
      }
    });
  }
}
