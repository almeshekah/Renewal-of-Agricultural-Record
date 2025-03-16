import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Application, ApplicationStatus } from '../models/application.model';
import { WorkflowService } from './workflow.service';
import { AuthService } from '../../auth/services/auth.service';

export interface ApplicationRecord {
  id: string;
  applicationNumber: string;
  title: string;
  applicantName: string;
  applicantId: string;
  submissionDate: string | null;
  status: string;
  farmLocation: string;
  address: string;
  mobileNumber: string;
  email: string;
  recordType: string;
  assignedTo?: string;
  assignedToId?: string;
  lastUpdated?: string;
  reviewComments?: string[];
  creationTime?: string;
  lastModificationTime?: string;
  applicant?: {
    name: string;
    id: string;
    email: string;
    phone: string;
  };
}

export interface TaskItem {
  id: string;
  name: string;
  description: string;
  created: string;
  dueDate: string;
  taskDefinitionKey: string;
  formKey?: string;
  applicationId?: string;
}

export interface ApplicationReview {
  applicationId: string;
  decision: string;
  comment: string;
  reviewerId: string;
  reviewerName: string;
  reviewDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(
    private http: HttpClient,
    private workflowService: WorkflowService,
    private authService: AuthService
  ) {}

  createApplication(application: Application): Observable<Application> {
    console.log('Creating application:', application);

    const applicationDto = {
      title: application.title,
      applicantName: application.applicant.name,
      applicantId: application.applicant.id,
      email: application.applicant.email,
      mobileNumber: application.applicant.phone,
      farmLocation: application.farmLocation ? application.farmLocation.address : '',
      address: application.address || '',
      recordType: application.recordType || 'Agricultural Record Renewal',
    };

    return this.http.post<any>(`${this.apiUrl}`, applicationDto).pipe(
      map(response => {
        const mappedApplication: Application = {
          id: response.id,
          applicationNumber: response.applicationNumber,
          title: response.title,
          status: response.status as ApplicationStatus,
          submissionDate: response.submissionDate,
          applicant: {
            id: response.applicantId,
            name: response.applicantName,
            email: response.email,
            phone: response.mobileNumber,
          },
          farmLocation: response.farmLocation
            ? {
                address: response.farmLocation,
              }
            : undefined,
          address: response.address,
          recordType: response.recordType,
          updatedAt: response.lastUpdated,
          comments: response.reviewComments
            ? response.reviewComments.map((comment: string) => ({
                userId: 'system',
                userName: 'System',
                text: comment,
                timestamp: new Date().toISOString(),
              }))
            : [],
          documents: [],
          reviews: [],
        };
        return mappedApplication;
      }),
      catchError(error => {
        console.error('Error creating application:', error);
        throw error;
      })
    );
  }

  getApplications(): Observable<ApplicationRecord[]> {
    console.log('Fetching all applications');

    return this.http.get<ApplicationRecord[]>(`${this.apiUrl}`).pipe(
      map(applications => {
        return applications.map(app => ({
          ...app,
          applicant: {
            id: app.applicantId,
            name: app.applicantName,
            email: app.email,
            phone: app.mobileNumber,
          },
        }));
      }),
      catchError(error => {
        console.error('Error fetching applications:', error);
        throw error;
      })
    );
  }

  getApplicationById(id: string): Observable<ApplicationRecord> {
    console.log(`Fetching application with ID ${id}`);

    return this.http.get<ApplicationRecord>(`${this.apiUrl}/${id}`).pipe(
      map(app => ({
        ...app,
        applicant: {
          id: app.applicantId,
          name: app.applicantName,
          email: app.email,
          phone: app.mobileNumber,
        },
      })),
      catchError(error => {
        console.error(`Error fetching application with ID ${id}:`, error);
        throw error;
      })
    );
  }

  updateApplication(applicationOrId: Application | string, updateData?: any): Observable<any> {
    let id: string;
    let data: any;

    if (typeof applicationOrId === 'string') {
      id = applicationOrId;
      data = updateData;
      console.log(`Updating application with ID ${id} using data:`, data);
    } else {
      id = applicationOrId.id;
      data = {
        title: applicationOrId.title,
        email: applicationOrId.applicant.email,
        mobileNumber: applicationOrId.applicant.phone,
        status: applicationOrId.status,
        farmLocation: applicationOrId.farmLocation ? applicationOrId.farmLocation.address : '',
        address: applicationOrId.address || '',
        recordType: applicationOrId.recordType || 'Agricultural Record Renewal',
      };
      console.log(`Updating application with ID ${id} using application object:`, data);
    }

    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(response => {
        console.log(`Update application response:`, response);
        if (typeof applicationOrId !== 'string') {
          const mappedApplication: Application = {
            id: response.id,
            applicationNumber: response.applicationNumber,
            title: response.title,
            status: response.status as ApplicationStatus,
            submissionDate: response.submissionDate,
            applicant: {
              id: response.applicantId,
              name: response.applicantName,
              email: response.email,
              phone: response.mobileNumber,
            },
            farmLocation: response.farmLocation
              ? {
                  address: response.farmLocation,
                }
              : undefined,
            address: response.address,
            recordType: response.recordType,
            updatedAt: response.lastUpdated,
            comments: response.reviewComments
              ? response.reviewComments.map((comment: string) => ({
                  userId: 'system',
                  userName: 'System',
                  text: comment,
                  timestamp: new Date().toISOString(),
                }))
              : [],
            documents: [],
            reviews: [],
          };
          console.log('Mapped application after update:', mappedApplication);
          return mappedApplication;
        }
        return response;
      }),
      catchError(error => {
        console.error(`Error updating application with ID ${id}:`, error);
        throw error;
      })
    );
  }

  deleteApplication(id: string): Observable<void> {
    console.log(`Deleting application with ID ${id}`);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting application with ID ${id}:`, error);
        throw error;
      })
    );
  }

  submitApplication(application: Application): Observable<Application> {
    const updatedApplication = {
      ...application,
      status: ApplicationStatus.SUBMITTED,
      submissionDate: new Date().toISOString(),
    };

    return this.updateApplication(updatedApplication).pipe(
      map(savedApplication => {
        this.workflowService
          .startProcess({
            applicationId: savedApplication.id,
            applicantId: savedApplication.applicant.id,
            processDefinitionKey: 'agricultural-record-renewal',
          })
          .subscribe(
            processInstance => {
              console.log('Workflow process started:', processInstance);
            },
            error => {
              console.error('Error starting workflow process:', error);
            }
          );

        return savedApplication;
      })
    );
  }

  getUserTasks(): Observable<TaskItem[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .get<{ tasks: TaskItem[] }>(`${environment.apiUrl}/workflow/tasks/assignee/${currentUser.id}`)
      .pipe(
        map(response => response.tasks || []),
        catchError(error => {
          console.error('Error fetching user tasks', error);
          throw error;
        })
      );
  }

  getApplicationTasks(applicationId: string): Observable<TaskItem[]> {
    return this.http
      .get<{ tasks: TaskItem[] }>(
        `${environment.apiUrl}/workflow/tasks/application/${applicationId}`
      )
      .pipe(
        map(response => response.tasks || []),
        catchError(error => {
          console.error(`Error fetching tasks for application ${applicationId}`, error);
          throw error;
        })
      );
  }

  completeTask(taskId: string, decision: string, comment: string): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated');
    }

    const payload = {
      taskId,
      decision,
      comment,
      userId: currentUser.id,
    };

    console.log(`Completing task ${taskId} with payload:`, payload);

    return this.http.post(`${environment.apiUrl}/workflow/tasks/${taskId}/complete`, payload).pipe(
      map(response => {
        console.log(`Task completion response:`, response);
        return response;
      }),
      catchError(error => {
        console.error(`Error completing task ${taskId}`, error);
        throw error;
      })
    );
  }

  getApplicationReviews(applicationId: string): Observable<ApplicationReview[]> {
    return this.http.get<ApplicationReview[]>(`${this.apiUrl}/${applicationId}/reviews`).pipe(
      catchError(error => {
        console.error(`Error fetching reviews for application ${applicationId}`, error);
        throw error;
      })
    );
  }

  getAssignedApplications(userRole?: string): Observable<ApplicationRecord[]> {
    console.log(`Fetching applications assigned to role: ${userRole}`);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const userId = currentUser.id;
    const role =
      userRole || (currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles[0] : '');

    return this.http
      .get<ApplicationRecord[]>(`${this.apiUrl}/assigned?userId=${userId}&role=${role}`)
      .pipe(
        map(applications => {
          return applications.map(app => ({
            ...app,
            applicant: {
              id: app.applicantId,
              name: app.applicantName,
              email: app.email,
              phone: app.mobileNumber,
            },
          }));
        }),
        catchError(error => {
          console.error('Error fetching assigned applications', error);
          throw error;
        })
      );
  }

  generateApplicationNumber(): string {
    const prefix = 'AGR';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  getTasksByApplicationId(applicationId: string): Observable<any[]> {
    return this.http.get(`${environment.apiUrl}/workflow/tasks/application/${applicationId}`).pipe(
      map((response: any) => response.tasks || []),
      catchError(error => {
        console.error(`Error getting tasks for application ${applicationId}`, error);
        throw error;
      })
    );
  }
}
