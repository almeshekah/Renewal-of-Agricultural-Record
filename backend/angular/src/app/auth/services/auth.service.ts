import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  role: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {}

  login(username: string, password: string): Observable<User> {
    // Simulate API call with mock data
    return of(this.getMockUser(username)).pipe(delay(1000));
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('isLoggedIn');
  }

  private getMockUser(username: string): User {
    // Mock user data based on username
    switch (username) {
      case 'lp-specialist':
        return {
          id: '1',
          username: 'lp-specialist',
          role: 'lp-specialist',
          name: 'LP Specialist',
        };
      case 'agriculture-manager':
        return {
          id: '2',
          username: 'agriculture-manager',
          role: 'agriculture-manager',
          name: 'Agriculture Manager',
        };
      case 'coo':
        return {
          id: '3',
          username: 'coo',
          role: 'coo',
          name: 'Chief Operating Officer',
        };
      default:
        return {
          id: '4',
          username: username,
          role: 'applicant',
          name: 'Applicant User',
        };
    }
  }
}
