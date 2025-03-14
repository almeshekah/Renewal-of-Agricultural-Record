import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, OAuthModule],
  exports: [LoginComponent],
  providers: [OAuthService],
})
export class AuthModule {
  constructor(private oauthService: OAuthService) {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
