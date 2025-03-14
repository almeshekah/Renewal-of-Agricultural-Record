import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Application, ApplicationStatus, Review } from '../models/application.model';
import { MOCK_APPLICATIONS } from '../data/mock-applications';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = 'api/applications';
  private applications: Application[] = [];

  constructor(private http: HttpClient) {
    // Initialize with mock data for development
    this.applications = MOCK_APPLICATIONS.map(app => ({
      ...app,
      status: app.status,
    }));
  }

  getApplications(): Observable<Application[]> {
    // Check local storage for any submitted applications
    const storedApps = localStorage.getItem('submittedApplications');
    let localApps: Application[] = [];

    if (storedApps) {
      try {
        localApps = JSON.parse(storedApps);
      } catch (e) {
        console.error('Error parsing stored applications', e);
      }
    }

    // Combine stored applications with existing ones, ensuring unique IDs
    const allApps = [...this.applications];

    localApps.forEach(localApp => {
      if (!allApps.some(app => app.id === localApp.id)) {
        allApps.push(localApp);
      }
    });

    return of(allApps);
  }

  getApplication(id: number): Observable<Application> {
    // For development, use mock data
    const application = this.applications.find(app => app.id === id);

    if (application) {
      return of(application);
    }

    return this.http.get<Application>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createApplication(application: Partial<Application>): Observable<Application> {
    const newId = this.generateId();
    const newApplication: Application = {
      id: newId,
      applicationNumber: this.generateApplicationNumber(),
      title: application.title || 'New Application',
      applicant: application.applicant!,
      farmLocation: application.farmLocation!,
      documents: application.documents || [],
      status: ApplicationStatus.DRAFT,
      submittedAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      reviews: [],
    };

    this.applications.push(newApplication);
    return of(newApplication);
  }

  updateApplication(id: number, changes: Partial<Application>): Observable<Application> {
    const index = this.applications.findIndex(app => app.id === id);

    if (index !== -1) {
      const updatedApplication = {
        ...this.applications[index],
        ...changes,
        updatedAt: new Date(),
      };

      this.applications[index] = updatedApplication;
      return of(updatedApplication);
    }

    return throwError(() => new Error(`Application with id ${id} not found`));
  }

  deleteApplication(id: number): Observable<void> {
    const index = this.applications.findIndex(app => app.id === id);

    if (index !== -1) {
      this.applications.splice(index, 1);
      return of(void 0);
    }

    return throwError(() => new Error(`Application with id ${id} not found`));
  }

  submitApplication(id: number): Observable<Application> {
    return this.updateApplication(id, { status: ApplicationStatus.SUBMITTED });
  }

  submitReview(applicationId: number, review: Review): Observable<Application> {
    const application = this.applications.find(app => app.id === applicationId);

    if (!application) {
      return throwError(() => new Error(`Application with id ${applicationId} not found`));
    }

    const updatedReviews = [...application.reviews, review];
    let newStatus: ApplicationStatus;

    // Update status based on reviewer role and decision
    switch (review.reviewerRole) {
      case 'LP_SPECIALIST':
        newStatus =
          review.decision === 'APPROVE'
            ? ApplicationStatus.APPROVED_BY_LP
            : ApplicationStatus.REJECTED_BY_LP;
        break;
      case 'AGRICULTURE_MANAGER':
        newStatus =
          review.decision === 'APPROVE'
            ? ApplicationStatus.APPROVED_BY_AGRICULTURE
            : ApplicationStatus.REJECTED_BY_AGRICULTURE;
        break;
      case 'COO':
        newStatus =
          review.decision === 'APPROVE' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;
        break;
      default:
        newStatus = application.status;
    }

    return this.updateApplication(applicationId, {
      reviews: updatedReviews,
      status: newStatus,
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private generateId(): number {
    const maxId = this.applications.reduce((max, app) => (app.id > max ? app.id : max), 0);
    return maxId + 1;
  }

  private generateApplicationNumber(): string {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ARR-${year}-${randomDigits}`;
  }
}
