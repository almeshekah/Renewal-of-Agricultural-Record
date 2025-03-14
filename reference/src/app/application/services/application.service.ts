import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Application, ApplicationStatus, ApplicationStatusType } from '../models/application.model';
import { MOCK_APPLICATIONS } from '../data/mock-applications';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = `${environment.apis.default.url}/api/app/application`;
  private applications: Application[] = [];

  constructor(private http: HttpClient) {
    // Convert old application status to new format
    this.applications = MOCK_APPLICATIONS.map(app => ({
      ...app,
      status: this.mapApplicationStatus(app.status as ApplicationStatus),
    }));
  }

  /**
   * Get all applications
   */
  getApplications(): Observable<Application[]> {
    // First check if we have applications from form submission in localStorage
    const storedApplications = localStorage.getItem('agricultural_applications');
    if (storedApplications) {
      try {
        const parsedApps = JSON.parse(storedApplications);
        // Merge with existing applications, keeping unique IDs
        const existingIds = new Set(this.applications.map(app => app.id));
        const newApps = parsedApps.filter((app: Application) => !existingIds.has(app.id));

        // Add the new applications to the front of the list
        this.applications = [...newApps, ...this.applications];

        console.log('Loaded applications from localStorage:', this.applications);
      } catch (e) {
        console.error('Error parsing applications from localStorage:', e);
      }
    }

    // Simulate API call with delay
    return of(this.applications).pipe(
      catchError(this.handleError<Application[]>('getApplications'))
    );
  }

  /**
   * Get application by ID
   */
  getApplication(id: string): Observable<Application> {
    // For development/testing, use mock data if API is not available
    if (!environment.production) {
      return of(this.getMockApplication(id)).pipe(
        catchError(this.handleError<Application>('getApplication'))
      );
    }

    return this.http
      .get<Application>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError<Application>('getApplication')));
  }

  /**
   * Create new application
   */
  createApplication(application: Partial<Application>): Observable<Application> {
    const newApplication: Application = {
      ...(application as Application),
      id: this.getNextId(),
      applicationNumber: this.generateApplicationNumber(),
      status: 'draft' as ApplicationStatusType,
      updatedAt: new Date(),
      comments: [],
      documents: [],
    };

    this.applications.unshift(newApplication);
    return of(newApplication).pipe(catchError(this.handleError<Application>('createApplication')));
  }

  /**
   * Update existing application
   */
  updateApplication(id: string, changes: Partial<Application>): Observable<Application> {
    let updatedApplication: Application | undefined;

    this.applications = this.applications.map(app => {
      if (app.id.toString() === id) {
        updatedApplication = {
          ...app,
          ...changes,
          updatedAt: new Date(),
        };
        return updatedApplication;
      }
      return app;
    });

    if (!updatedApplication) {
      throw new Error(`Application with ID ${id} not found`);
    }

    return of(updatedApplication).pipe(
      catchError(this.handleError<Application>('updateApplication'))
    );
  }

  /**
   * Delete application
   */
  deleteApplication(id: string): Observable<boolean> {
    const initialLength = this.applications.length;
    this.applications = this.applications.filter(app => app.id.toString() !== id);

    return of(initialLength !== this.applications.length).pipe(
      catchError(this.handleError<boolean>('deleteApplication'))
    );
  }

  /**
   * Submit application
   */
  submitApplication(id: string): Observable<Application> {
    return this.updateApplication(id, {
      status: 'pending' as ApplicationStatusType,
      submittedAt: new Date(),
    }).pipe(catchError(this.handleError<Application>('submitApplication')));
  }

  /**
   * Submit specialist review for an application
   */
  submitSpecialistReview(review: {
    applicationId: string | number;
    decision: 'APPROVE' | 'RETURN' | 'REJECT';
    comments: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewerRole?: string;
  }) {
    // For now, we'll simulate the API call with a delay
    return new Observable(observer => {
      setTimeout(() => {
        try {
          // Convert applicationId to number if it's a string
          const appId =
            typeof review.applicationId === 'string'
              ? parseInt(review.applicationId, 10)
              : review.applicationId;

          const application = this.applications.find(app => app.id === appId);

          if (!application) {
            observer.error(new Error('Application not found'));
            return;
          }

          console.log(
            'Specialist review - updating application status based on decision:',
            review.decision
          );

          // Update application status based on decision
          switch (review.decision) {
            case 'APPROVE':
              application.status = ApplicationStatus.APPROVED_BY_LP;
              break;
            case 'RETURN':
              application.status = ApplicationStatus.RETURNED_BY_LP;
              break;
            case 'REJECT':
              application.status = ApplicationStatus.REJECTED;
              break;
          }

          // Add review comments
          if (!application.reviews) {
            application.reviews = [];
          }

          application.reviews.push({
            reviewerId: review.reviewerId || 'specialist-1',
            reviewerName: review.reviewerName || 'L&P Specialist',
            reviewerRole: review.reviewerRole || 'LP_SPECIALIST',
            decision: review.decision,
            comments: review.comments,
            timestamp: new Date().toISOString(),
          });

          observer.next(application);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Submit manager review for an application
   */
  submitManagerReview(review: {
    applicationId: string | number;
    decision: 'APPROVE' | 'RETURN';
    comments: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewerRole?: string;
  }) {
    // For now, we'll simulate the API call with a delay
    return new Observable(observer => {
      setTimeout(() => {
        try {
          // Convert applicationId to number if it's a string
          const appId =
            typeof review.applicationId === 'string'
              ? parseInt(review.applicationId, 10)
              : review.applicationId;

          const application = this.applications.find(app => app.id === appId);

          if (!application) {
            observer.error(new Error('Application not found'));
            return;
          }

          console.log(
            'Manager review - updating application status based on decision:',
            review.decision
          );

          // Update application status based on decision
          switch (review.decision) {
            case 'APPROVE':
              application.status = ApplicationStatus.APPROVED_BY_MANAGER;
              break;
            case 'RETURN':
              application.status = ApplicationStatus.RETURNED_BY_MANAGER;
              break;
          }

          // Add review comments
          if (!application.reviews) {
            application.reviews = [];
          }

          application.reviews.push({
            reviewerId: review.reviewerId || 'manager-1',
            reviewerName: review.reviewerName || 'Agriculture Manager',
            reviewerRole: review.reviewerRole || 'AGRICULTURE_MANAGER',
            decision: review.decision,
            comments: review.comments,
            timestamp: new Date().toISOString(),
          });

          observer.next(application);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Submit COO review for an application
   */
  submitCOOReview(review: {
    applicationId: string | number;
    decision: 'APPROVE' | 'RETURN' | 'REJECT';
    comments: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewerRole?: string;
  }) {
    // For now, we'll simulate the API call with a delay
    return new Observable(observer => {
      setTimeout(() => {
        try {
          // Convert applicationId to number if it's a string
          const appId =
            typeof review.applicationId === 'string'
              ? parseInt(review.applicationId, 10)
              : review.applicationId;

          const application = this.applications.find(app => app.id === appId);

          if (!application) {
            observer.error(new Error('Application not found'));
            return;
          }

          console.log(
            'COO review - updating application status based on decision:',
            review.decision
          );

          // Update application status based on decision
          switch (review.decision) {
            case 'APPROVE':
              application.status = ApplicationStatus.APPROVED;
              break;
            case 'RETURN':
              application.status = ApplicationStatus.RETURNED_BY_COO;
              break;
            case 'REJECT':
              application.status = ApplicationStatus.REJECTED;
              break;
          }

          // Add review comments
          if (!application.reviews) {
            application.reviews = [];
          }

          application.reviews.push({
            reviewerId: review.reviewerId || 'coo-1',
            reviewerName: review.reviewerName || 'Chief Operating Officer',
            reviewerRole: review.reviewerRole || 'COO',
            decision: review.decision,
            comments: review.comments,
            timestamp: new Date().toISOString(),
          });

          observer.next(application);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Helper methods
   */
  private getNextId(): number {
    return Math.max(...this.applications.map(app => app.id), 0) + 1;
  }

  private generateApplicationNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ARR-${year}-${randomNum}`;
  }

  private mapApplicationStatus(oldStatus: ApplicationStatus): ApplicationStatusType {
    switch (oldStatus) {
      case ApplicationStatus.DRAFT:
        return 'DRAFT';
      case ApplicationStatus.SUBMITTED:
        return 'SUBMITTED';
      case ApplicationStatus.UNDER_REVIEW_LP:
        return 'UNDER_REVIEW_LP';
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
        return 'UNDER_REVIEW_MANAGER';
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'UNDER_REVIEW_COO';
      case ApplicationStatus.APPROVED:
        return 'APPROVED';
      case ApplicationStatus.APPROVED_BY_LP:
        return 'APPROVED_BY_LP';
      case ApplicationStatus.APPROVED_BY_MANAGER:
        return 'APPROVED_BY_MANAGER';
      case ApplicationStatus.REJECTED:
        return 'REJECTED';
      case ApplicationStatus.RETURNED_BY_LP:
        return 'RETURNED_BY_LP';
      case ApplicationStatus.RETURNED_BY_MANAGER:
        return 'RETURNED_BY_MANAGER';
      case ApplicationStatus.RETURNED_BY_COO:
        return 'RETURNED_BY_COO';
      default:
        return 'SUBMITTED';
    }
  }

  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result
      return of(null as T);
    };
  }

  // Convert status to display value (if needed for UI)
  getStatusDisplayValue(status: ApplicationStatus | ApplicationStatusType): string {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return 'Draft';
      case ApplicationStatus.SUBMITTED:
        return 'Submitted';
      case ApplicationStatus.UNDER_REVIEW_LP:
      case ApplicationStatus.UNDER_REVIEW_MANAGER:
      case ApplicationStatus.UNDER_REVIEW_COO:
        return 'In Review';
      case ApplicationStatus.APPROVED:
        return 'Approved';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      default:
        return 'In Review';
    }
  }

  // Get status for application
  getStatus(statusValue: number): ApplicationStatus {
    switch (statusValue) {
      case 0:
        return ApplicationStatus.DRAFT;
      case 1:
        return ApplicationStatus.SUBMITTED;
      case 2:
        return ApplicationStatus.UNDER_REVIEW_LP;
      case 3:
        return ApplicationStatus.RETURNED_BY_LP;
      case 4:
        return ApplicationStatus.APPROVED_BY_LP;
      case 5:
        return ApplicationStatus.UNDER_REVIEW_MANAGER;
      case 6:
        return ApplicationStatus.RETURNED_BY_MANAGER;
      case 7:
        return ApplicationStatus.APPROVED_BY_MANAGER;
      case 8:
        return ApplicationStatus.UNDER_REVIEW_COO;
      case 9:
        return ApplicationStatus.RETURNED_BY_COO;
      case 10:
        return ApplicationStatus.APPROVED;
      case 11:
        return ApplicationStatus.REJECTED;
      default:
        return ApplicationStatus.SUBMITTED;
    }
  }

  // Mock data for development/testing
  private getMockApplication(id: string): Application {
    return {
      id: parseInt(id),
      applicationNumber: `ARR-2025-${id.padStart(3, '0')}`,
      title: 'Farm Record Renewal - Eastern Region',
      applicant: {
        id: 1,
        name: 'Ahmad Al Saud',
        email: 'ahmad@example.com',
        phone: '+966 50 123 4567',
        nationalId: '1234567890',
        address: '123 King Fahd Road, Riyadh',
      },
      farmLocation: {
        latitude: 24.7136,
        longitude: 46.6753,
        address: 'Eastern Farm District, Plot 45, Eastern Region',
        size: 25.5,
        crops: ['Wheat', 'Barley', 'Dates'],
      },
      documents: [
        {
          id: 1,
          name: 'Land Deed',
          type: 'PDF',
          url: '/assets/mock/land-deed.pdf',
          uploadedAt: new Date(),
        },
        {
          id: 2,
          name: 'Previous License',
          type: 'PDF',
          url: '/assets/mock/previous-license.pdf',
          uploadedAt: new Date(),
        },
        {
          id: 3,
          name: 'Farm Photos',
          type: 'ZIP',
          url: '/assets/mock/farm-photos.zip',
          uploadedAt: new Date(),
        },
      ],
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date('2025-02-15T03:00:00'),
      updatedAt: new Date('2025-02-15T03:00:00'),
      comments: [],
    };
  }
}
