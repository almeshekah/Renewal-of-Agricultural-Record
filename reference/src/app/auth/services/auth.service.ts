import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../data/mock-users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly STORAGE_KEY = 'agricultural_renewal_user';

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  login(username: string, password: string): Observable<User> {
    // In a real app, this would be an API call
    const foundUser = MOCK_USERS.find(user => user.username === username);

    if (foundUser && password === 'password') {
      // Simple password check for demo
      // Add a fake token
      const authenticatedUser = {
        ...foundUser,
        token: `fake-jwt-token-${foundUser.id}-${Date.now()}`,
      };

      // Store user in local storage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authenticatedUser));
      this.currentUserSubject.next(authenticatedUser);

      // Simulate network delay
      return of(authenticatedUser).pipe(
        delay(800),
        tap(user => console.log('User authenticated:', user))
      );
    }

    return throwError(() => new Error('Username or password is incorrect'));
  }

  // Demo mode: Instant login without password check
  loginForDemo(): void {
    console.log('Using demo login');
    const demoUser = MOCK_USERS.find(user => user.username === 'demo_user') || MOCK_USERS[0];

    const authenticatedUser = {
      ...demoUser,
      token: `demo-token-${Date.now()}`,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authenticatedUser));
    this.currentUserSubject.next(authenticatedUser);
    console.log('Demo user authenticated:', authenticatedUser);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: User['role']): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === role;
  }
}
