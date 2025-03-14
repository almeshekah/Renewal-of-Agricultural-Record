import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApplicationStatus } from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  constructor() {}

  // Simulates waiting for the action to complete
  simulateProcessing(message: string, duration: number = 1500): Observable<string> {
    return of(message).pipe(delay(duration));
  }

  // Gets the next status based on the current status and action
  getNextStatus(
    currentStatus: ApplicationStatus,
    action:
      | 'SUBMIT'
      | 'SEND_TO_LP'
      | 'APPROVE_LP'
      | 'SEND_TO_MANAGER'
      | 'APPROVE_MANAGER'
      | 'SEND_TO_COO'
      | 'APPROVE_COO'
      | 'REJECT'
      | 'RETURN'
  ): ApplicationStatus {
    switch (action) {
      case 'SUBMIT':
        return ApplicationStatus.SUBMITTED;
      case 'SEND_TO_LP':
        return ApplicationStatus.PENDING_LP_REVIEW;
      case 'APPROVE_LP':
        return ApplicationStatus.APPROVED_BY_LP;
      case 'SEND_TO_MANAGER':
        return ApplicationStatus.PENDING_AGRICULTURE_REVIEW;
      case 'APPROVE_MANAGER':
        return ApplicationStatus.APPROVED_BY_AGRICULTURE;
      case 'SEND_TO_COO':
        return ApplicationStatus.PENDING_COO_REVIEW;
      case 'APPROVE_COO':
        return ApplicationStatus.APPROVED;
      case 'REJECT':
        if (currentStatus === ApplicationStatus.PENDING_LP_REVIEW) {
          return ApplicationStatus.REJECTED_BY_LP;
        } else if (currentStatus === ApplicationStatus.PENDING_AGRICULTURE_REVIEW) {
          return ApplicationStatus.REJECTED_BY_AGRICULTURE;
        } else {
          return ApplicationStatus.REJECTED;
        }
      case 'RETURN':
        // Return to previous step
        if (currentStatus === ApplicationStatus.PENDING_LP_REVIEW) {
          return ApplicationStatus.SUBMITTED;
        } else if (currentStatus === ApplicationStatus.PENDING_AGRICULTURE_REVIEW) {
          return ApplicationStatus.APPROVED_BY_LP;
        } else if (currentStatus === ApplicationStatus.PENDING_COO_REVIEW) {
          return ApplicationStatus.APPROVED_BY_AGRICULTURE;
        } else {
          return currentStatus;
        }
      default:
        return currentStatus;
    }
  }

  // Determines if a user with a given role can perform an action on an application in the given status
  canPerformAction(
    status: ApplicationStatus,
    role: 'APPLICANT' | 'LP_SPECIALIST' | 'AGRICULTURE_MANAGER' | 'COO',
    action:
      | 'SUBMIT'
      | 'SEND_TO_LP'
      | 'APPROVE_LP'
      | 'REJECT_LP'
      | 'SEND_TO_MANAGER'
      | 'APPROVE_MANAGER'
      | 'REJECT_MANAGER'
      | 'SEND_TO_COO'
      | 'APPROVE_COO'
      | 'REJECT_COO'
  ): boolean {
    switch (role) {
      case 'APPLICANT':
        return action === 'SUBMIT' && status === ApplicationStatus.DRAFT;

      case 'LP_SPECIALIST':
        return (
          (action === 'APPROVE_LP' && status === ApplicationStatus.PENDING_LP_REVIEW) ||
          (action === 'REJECT_LP' && status === ApplicationStatus.PENDING_LP_REVIEW)
        );

      case 'AGRICULTURE_MANAGER':
        return (
          (action === 'APPROVE_MANAGER' &&
            status === ApplicationStatus.PENDING_AGRICULTURE_REVIEW) ||
          (action === 'REJECT_MANAGER' && status === ApplicationStatus.PENDING_AGRICULTURE_REVIEW)
        );

      case 'COO':
        return (
          (action === 'APPROVE_COO' && status === ApplicationStatus.PENDING_COO_REVIEW) ||
          (action === 'REJECT_COO' && status === ApplicationStatus.PENDING_COO_REVIEW)
        );

      default:
        return false;
    }
  }
}
