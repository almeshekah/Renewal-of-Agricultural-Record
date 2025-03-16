import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if the user is logged in
    if (!this.authService.isLoggedIn()) {
      // User is not logged in, redirect to login page
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // Check for required roles
    const requiredRoles = route.data['roles'] as Array<string>;
    if (!requiredRoles || requiredRoles.length === 0) {
      // No specific roles required
      return true;
    }

    // Get the user's role from the AuthService
    const userRole = this.authService.getUserRole();

    // Check if the user has any of the required roles
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // User doesn't have the required role, redirect to dashboard or unauthorized page
    return this.router.createUrlTree(['/dashboard']);
  }
}
