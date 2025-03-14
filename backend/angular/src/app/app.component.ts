import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Agricultural Record Renewal';
  isLoggedIn = false;
  isLoginPage = false;
  isServicesPage = false;
  currentYear = new Date().getFullYear();

  constructor(
    public translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Set default language
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
    console.log('[AppComponent] Initialized');

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.url === '/login';
        this.isServicesPage = event.url.includes('/services');
      });
  }

  ngOnInit() {
    console.log('[AppComponent] OnInit');
  }
}
