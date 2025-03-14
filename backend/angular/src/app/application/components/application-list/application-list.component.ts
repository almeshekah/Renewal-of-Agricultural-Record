import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Application, ApplicationStatus } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];

  // Make ApplicationStatus available to the template
  ApplicationStatus = ApplicationStatus;

  // User role (would normally come from auth service)
  currentUserRole: 'APPLICANT' | 'LP_SPECIALIST' | 'AGRICULTURE_MANAGER' | 'COO' = 'APPLICANT';

  // Filter options
  statusFilter: string = 'ALL';
  searchTerm: string = '';
  dateFilter: 'newest' | 'oldest' = 'newest';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  // Status display mapping
  statusDisplayMap = {
    [ApplicationStatus.DRAFT]: 'Draft',
    [ApplicationStatus.SUBMITTED]: 'Submitted',
    [ApplicationStatus.IN_REVIEW]: 'In Review',
    [ApplicationStatus.PENDING_LP_REVIEW]: 'Pending LP Review',
    [ApplicationStatus.APPROVED_BY_LP]: 'Approved by LP',
    [ApplicationStatus.REJECTED_BY_LP]: 'Rejected by LP',
    [ApplicationStatus.PENDING_AGRICULTURE_REVIEW]: 'Pending Agriculture Review',
    [ApplicationStatus.APPROVED_BY_AGRICULTURE]: 'Approved by Agriculture',
    [ApplicationStatus.REJECTED_BY_AGRICULTURE]: 'Rejected by Agriculture',
    [ApplicationStatus.PENDING_COO_REVIEW]: 'Pending COO Review',
    [ApplicationStatus.APPROVED]: 'Approved',
    [ApplicationStatus.REJECTED]: 'Rejected',
  };

  constructor(private router: Router, private applicationService: ApplicationService) {}

  ngOnInit(): void {
    // In a real app, we would get the current user's role from an auth service
    this.getCurrentUserInfo();
    this.loadApplications();
  }

  getCurrentUserInfo(): void {
    // This would normally come from an auth service
    // For demo purposes, we'll just set a default role
    this.currentUserRole = 'APPLICANT';
  }

  loadApplications(): void {
    this.applicationService.getApplications().subscribe(
      applications => {
        this.applications = applications;
        this.applyFilters();
      },
      error => {
        console.error('Error loading applications', error);
      }
    );
  }

  createNewApplication(): void {
    this.router.navigate(['/application/new']);
  }

  viewApplication(id: number): void {
    this.router.navigate(['/application/detail', id]);
  }

  editApplication(id: number): void {
    this.router.navigate(['/application/edit', id]);
  }

  deleteApplication(id: number): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(id).subscribe(
        () => {
          this.loadApplications();
        },
        error => {
          console.error('Error deleting application', error);
        }
      );
    }
  }

  reviewApplication(id: number): void {
    // Navigate to the appropriate review page based on user role
    switch (this.currentUserRole) {
      case 'LP_SPECIALIST':
        this.router.navigate(['/application/review', id, 'specialist']);
        break;
      case 'AGRICULTURE_MANAGER':
        this.router.navigate(['/application/review', id, 'manager']);
        break;
      case 'COO':
        this.router.navigate(['/application/review', id, 'coo']);
        break;
      default:
        this.viewApplication(id);
    }
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    // Filter by status
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    // Filter by search term (application number or title)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.applicationNumber.toLowerCase().includes(term) ||
          app.title.toLowerCase().includes(term) ||
          app.applicant.name.toLowerCase().includes(term)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return this.dateFilter === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Update pagination
    this.totalItems = filtered.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredApplications = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  onDateFilterChange(filter: 'newest' | 'oldest'): void {
    this.dateFilter = filter;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'status-draft';
      case ApplicationStatus.SUBMITTED:
      case ApplicationStatus.IN_REVIEW:
      case ApplicationStatus.PENDING_LP_REVIEW:
      case ApplicationStatus.PENDING_AGRICULTURE_REVIEW:
      case ApplicationStatus.PENDING_COO_REVIEW:
        return 'status-pending';
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

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pageCount = this.totalPages;
    const maxPagesToShow = 5;

    if (pageCount <= maxPagesToShow) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    // Show pages around current page
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > pageCount) {
      endPage = pageCount;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}
