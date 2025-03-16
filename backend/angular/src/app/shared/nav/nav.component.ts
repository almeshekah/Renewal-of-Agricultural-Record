import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/models/user.model';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  userName: string = '';
  userRole: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to changes in the current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || user.username;
        this.userRole = user.role;
      } else {
        this.userName = 'Guest';
        this.userRole = 'Guest';
      }
    });
  }

  logout(): void {
    console.log('User initiated logout');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful, redirecting to login page');
        this.router.navigate(['/login']);
      },
      error: error => {
        console.error('Error during logout:', error);
        // Even on error, redirect to login
        this.router.navigate(['/login']);
      },
    });
  }
}
