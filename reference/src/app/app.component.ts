import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title = 'Agricultural Application';
	isLoggedIn = false;
	isLoginPage = false;
	isServicesPage = false;

	constructor(
		private translateService: TranslateService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService
	) {
		// Set default language
		this.translateService.setDefaultLang('en');
		this.translateService.use('en');
		console.log('[AppComponent] Initialized');
	}

	ngOnInit() {
		console.log('[AppComponent] OnInit');

		// Check if we should use mock auth based on environment config
		if (environment.useMockAuth) {
			console.log('[AppComponent] Using MOCK authentication for development');

			// Auto-login immediately for development
			this.authService.loginForDemo();

			// Navigate to app if on login page
			if (this.router.url.includes('/auth/login')) {
				this.router.navigate(['/application/list']);
			}
		}

		// Check if user is logged in
		this.authService.currentUser$.subscribe((user) => {
			this.isLoggedIn = !!user;

			// Auto-login for demo if not authenticated and in development
			if (!this.isLoggedIn && environment.useMockAuth) {
				console.log('[AppComponent] Auto-login for demo');
				this.autoLoginForDemo();
			}
		});

		// Check if current route is login page or services page
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				const currentUrl = this.router.url;
				this.isLoginPage =
					currentUrl.includes('/auth/login') || currentUrl === '/login';
				this.isServicesPage =
					currentUrl.includes('/services') ||
					currentUrl.includes('/farm-renewal-application');
				console.log(
					'[AppComponent] Current URL:',
					currentUrl,
					'Is Services Page:',
					this.isServicesPage
				);

				// Force login if on a protected page
				if (
					!this.isLoginPage &&
					!this.isLoggedIn &&
					(currentUrl.includes('/home/services') ||
						currentUrl.includes('/farm-renewal-application'))
				) {
					this.autoLoginForDemo();
				}
			});
	}

	// Auto-login for demo purposes using mock credentials
	private autoLoginForDemo() {
		// Use direct login method instead of async
		this.authService.loginForDemo();
	}
}
