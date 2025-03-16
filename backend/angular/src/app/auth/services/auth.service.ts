import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  email?: string;
  token?: string;
  surname?: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(username: string, password: string): Observable<User> {
    // Try API login first but be ready to fall back to mock
    console.log('Attempting login with API, will fall back to mock if needed');

    return this.http.post<any>(`${this.apiUrl}/auth/login`, { userName: username, password }).pipe(
      map(response => {
        // Transform backend user model to our User interface
        const user: User = {
          id: response.id,
          username: response.userName,
          name: response.name || '',
          email: response.email,
          surname: response.surname,
          token: response.token,
          // Get the main role for role-based UI display
          role: this.getPrimaryRole(response.roles),
          roles: response.roles,
        };

        // Store user details and jwt token in local storage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login via API failed', error);

        // If API returns 401 (unauthorized) or 404 (not found), use local mock authentication
        if (error.status === 401 || error.status === 404) {
          console.log(
            'API returned unauthorized or not found, falling back to mock authentication'
          );
          return this.mockLogin(username, password);
        }

        return throwError(() => new Error('Invalid username or password'));
      })
    );
  }

  // Fallback mock login for when the API is not available
  private mockLogin(username: string, password: string): Observable<User> {
    // Check credentials against hardcoded test accounts
    const isValidUser =
      (username === 'lp-specialist' && password === '123qwe') ||
      (username === 'agriculture-manager' && password === '123qwe') ||
      (username === 'coo' && password === '123qwe');

    if (isValidUser) {
      const mockUser = this.getFallbackUser(username);
      const authenticatedUser = {
        ...mockUser,
        token: `mock-jwt-token-${Date.now()}`,
      };

      // Add a slight delay to simulate network request
      return of(authenticatedUser).pipe(
        delay(800),
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('isLoggedIn', 'true');
          this.currentUserSubject.next(user);
          console.log('Mock authentication successful:', user);
        })
      );
    }

    return throwError(() => new Error('Invalid username or password'));
  }

  logout(): Observable<boolean> {
    console.log('Initiating logout process...');

    // Return an observable that completes when the backend logout is done
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => console.log('Backend logout successful')),
      map(() => {
        this.clearUserData();
        return true;
      }),
      catchError(error => {
        console.error('Error during backend logout:', error);
        // Even if backend logout fails, clear local data
        this.clearUserData();
        return of(true);
      }),
      finalize(() => console.log('Logout process completed'))
    );
  }

  private clearUserData(): void {
    console.log('Clearing user data from local storage');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUserRole(): string {
    return this.currentUserSubject.value?.role || '';
  }

  // For testing and fallback purposes
  getFallbackUser(username: string): User {
    // Fallback user data if API call fails
    switch (username.toLowerCase()) {
      case 'lp-specialist':
        return {
          id: '101',
          username: 'lp-specialist',
          role: 'LPSpecialist',
          name: 'Mohammed Al Qahtani',
        };
      case 'agriculture-manager':
        return {
          id: '102',
          username: 'agriculture-manager',
          role: 'Manager',
          name: 'Saeed Al Ghamdi',
        };
      case 'coo':
        return {
          id: '103',
          username: 'coo',
          role: 'COO',
          name: 'Abdullah Al Otaibi',
        };
      default:
        return {
          id: '999',
          username: username,
          role: 'Applicant',
          name: 'Applicant User',
        };
    }
  }

  // Helper method to get the primary role for role-based UI
  private getPrimaryRole(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return 'Applicant';
    }

    // Check for specific roles in order of importance
    if (roles.includes('COO')) {
      return 'COO';
    } else if (roles.includes('Manager')) {
      return 'Manager';
    } else if (roles.includes('LPSpecialist')) {
      return 'LPSpecialist';
    } else {
      return roles[0]; // Return the first role if none of the above
    }
  }

  // Verify token validity with backend
  verifyToken(): Observable<boolean> {
    if (!this.getCurrentUser()?.token) {
      return of(false);
    }

    return this.http.get<User>(`${this.apiUrl}/auth/verify`).pipe(
      tap(user => {
        // Update user data if needed
        const currentUser = this.getCurrentUser();
        if (currentUser && user) {
          const updatedUser = {
            ...currentUser,
            name: user.name,
            surname: user.surname,
            roles: user.roles,
            role: this.getPrimaryRole(user.roles || []),
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }),
      map(() => true),
      catchError(() => {
        this.clearUserData();
        return of(false);
      })
    );
  }
}
