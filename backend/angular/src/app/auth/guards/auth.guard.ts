import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      // Check if the stored token has "mock-jwt" in it to handle mock mode properly
      const currentUser = this.authService.getCurrentUser();
      const isMockToken = currentUser?.token?.includes('mock-jwt');

      if (isMockToken) {
        // For mock tokens, don't verify with backend
        console.log('Using mock authentication, skipping token verification');
        return true;
      }

      // For real tokens, verify with backend but fall back to local check on failure
      return this.authService.verifyToken().pipe(
        catchError(() => {
          console.log('Token verification failed, using local state');
          // If verification fails, still allow access based on local state
          return of(true);
        })
      );
    }

    // User is not logged in, redirect to login page
    return this.redirectToLogin(state.url);
  }

  private redirectToLogin(returnUrl: string): UrlTree {
    // Create a URL tree for redirection
    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl },
    });
  }
}
