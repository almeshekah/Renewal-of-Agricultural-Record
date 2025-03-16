import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  businessKey: string;
  status: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  assignee?: string;
  created?: string;
  dueDate?: string;
  processInstanceId: string;
  taskDefinitionKey: string;
  formKey?: string;
}

export interface TaskList {
  tasks: Task[];
}

export interface StartProcessParams {
  applicationId: string;
  applicantId: string;
  processDefinitionKey: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  farmLocation?: string;
}

export interface CompleteTaskParams {
  decision: string;
  comment?: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private apiUrl = `${environment.apiUrl}/workflow`;

  constructor(private http: HttpClient) {}

  startProcess(params: StartProcessParams): Observable<ProcessInstance> {
    const url = `${this.apiUrl}/start`;

    // Create the request in the format expected by the backend
    const body = {
      applicationId: params.applicationId,
      applicantId: params.applicantId,
      processDefinitionKey: params.processDefinitionKey,
      fullName: params.fullName,
      email: params.email,
      mobileNumber: params.mobileNumber,
      address: params.address,
      farmLocation: params.farmLocation,
    };

    console.log('Starting process with params:', body);

    return this.http.post<ProcessInstance>(url, body).pipe(catchError(this.handleError));
  }

  getTasksByAssignee(assignee: string): Observable<TaskList> {
    const url = `${this.apiUrl}/tasks/assignee/${assignee}`;
    return this.http.get<TaskList>(url).pipe(catchError(this.handleError));
  }

  getTasksByApplicationId(applicationId: string): Observable<TaskList> {
    const url = `${this.apiUrl}/tasks/application/${applicationId}`;
    return this.http.get<TaskList>(url).pipe(catchError(this.handleError));
  }

  completeTask(taskId: string, params: CompleteTaskParams): Observable<Task> {
    const url = `${this.apiUrl}/tasks/${taskId}/complete`;
    return this.http.post<Task>(url, params).pipe(catchError(this.handleError));
  }

  getCurrentTask(processInstanceId: string): Observable<Task> {
    const url = `${this.apiUrl}/tasks/current/${processInstanceId}`;
    return this.http.get<Task>(url).pipe(catchError(this.handleError));
  }

  addComment(taskId: string, userId: string, message: string): Observable<void> {
    const url = `${this.apiUrl}/tasks/${taskId}/comments`;
    return this.http.post<void>(url, message).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage = '';

    if (error.status === 0) {
      // A client-side or network error occurred
      errorMessage =
        'An error occurred: Could not connect to the server. Please check your network connection.';
    } else if (error.error instanceof ErrorEvent) {
      // A client-side error occurred
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 404) {
      // 404 Not Found
      errorMessage = 'Error: The requested resource was not found.';
    } else if (error.status === 405) {
      // 405 Method Not Allowed
      errorMessage = 'Error: The requested operation is not supported.';
    } else {
      // The backend returned an unsuccessful response code
      errorMessage = `Error Code: ${error.status}, Message: ${
        error.error.message || error.statusText
      }`;
    }

    console.error('Workflow service error:', errorMessage);
    return throwError(() => errorMessage);
  }
}
