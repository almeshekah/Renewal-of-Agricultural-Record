import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService
      .login(username, password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: user => {
          // Redirect based on user role
          switch (user.role) {
            case 'applicant':
              this.router.navigateByUrl('/applications/new');
              break;
            case 'lp-specialist':
            case 'agriculture-manager':
            case 'coo':
              // Redirect all reviewers to the applications list
              this.router.navigateByUrl('/applications');
              break;
            default:
              this.router.navigateByUrl('/');
          }
        },
        error: err => {
          this.errorMessage = err.message || 'Login failed. Please try again.';
        },
      });
  }

  selectTestAccount(role: string): void {
    if (!role) return;

    // Populate the form with the selected test account credentials
    this.loginForm.patchValue({
      username: role,
      password: '123qwe',
    });
  }
}
