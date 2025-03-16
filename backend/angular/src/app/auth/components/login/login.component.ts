import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  returnUrl: string = '/application';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Get return url from route parameters or default to '/application'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/application';

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
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
          console.log('Login successful:', user);
          // Navigate to the return URL
          this.router.navigateByUrl('/application');
        },
        error: err => {
          console.error('Login error:', err);
          this.errorMessage = err.message || 'Invalid username or password';
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
