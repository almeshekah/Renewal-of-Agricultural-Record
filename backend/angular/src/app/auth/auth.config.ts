import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.oAuthConfig.issuer,
  redirectUri: window.location.origin,
  clientId: environment.oAuthConfig.clientId,
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false, // Set to true in production
};
