import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  userName: string = 'John Doe';
  userRole: string = 'Applicant';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real app, you would get this from an authentication service
  }

  logout(): void {
    // In a real app, you would call an authentication service logout method
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
