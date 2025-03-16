import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';
import { CoreModule as AbpCoreModule, NAVIGATE_TO_MANAGE_PROFILE } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ThemeLeptonXModule } from '@abp/ng.theme.lepton-x';
import { SideMenuLayoutModule } from '@abp/ng.theme.lepton-x/layouts';
import { AccountLayoutModule } from '@abp/ng.theme.lepton-x/account';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AccountConfigModule } from '@abp/ng.account/config';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { MENU_PROVIDERS } from './providers/menu-items.provider';
import { AuthInterceptor } from './auth/interceptors/auth.interceptor';

// Feature Modules
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { LandingComponent } from './home/components/landing/landing.component';
import { AgriculturalRecordRenewalComponent } from './applications/components/agricultural-record-renewal/agricultural-record-renewal.component';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Initialize translations
export function initTranslations(translate: TranslateService) {
  return () => {
    // Set default and fallback languages
    translate.setDefaultLang('en');
    translate.addLangs(['en', 'ar']);

    // Determine browser language if available, otherwise use default
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|ar/) ? browserLang : 'en');

    console.log('[AppModule] Translations initialized with language:', translate.currentLang);
    return Promise.resolve(true);
  };
}

const LOGON_X_MODULES = [
  ThemeLeptonXModule.forRoot(),
  SideMenuLayoutModule.forRoot(),
  AccountLayoutModule.forRoot(),
  AccountConfigModule.forRoot(),
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AbpCoreModule.forRoot({
      environment,
      registerLocaleFn: registerLocale(),
    }),
    ThemeSharedModule.forRoot(),
    AppRoutingModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    OAuthModule.forRoot(),
    ...LOGON_X_MODULES,
    SharedModule,
    AuthModule,
    ApplicationModule,
    ReactiveFormsModule,
  ],
  declarations: [AppComponent, LandingComponent, AgriculturalRecordRenewalComponent],
  providers: [
    APP_ROUTE_PROVIDER,
    ...MENU_PROVIDERS,
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true,
    },
    {
      provide: NAVIGATE_TO_MANAGE_PROFILE,
      useValue: () => {
        console.log('Navigate to manage profile called');
        return Promise.resolve();
      },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private translate: TranslateService) {
    console.log('AppModule initialized with translations');
  }
}
