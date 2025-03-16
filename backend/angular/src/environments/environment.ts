import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'Agricultural Record Renewal',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'http://localhost:44392',
    clientId: 'Agricultural_Record_Renewal_App',
    dummyClientSecret: '1q2w3e*',
    scope: 'Agricultural_Record_Renewal',
    showDebugInformation: true,
    oidc: false,
    requireHttps: false,
  },
  apis: {
    default: {
      url: 'http://localhost:44392',
    },
  },
  apiUrl: 'http://localhost:44392/api',
} as Environment;
