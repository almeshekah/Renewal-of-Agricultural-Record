import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'AgriculturalRecordRenewal',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44392/',
    redirectUri: baseUrl,
    clientId: 'AgriculturalRecordRenewal_App',
    responseType: 'code',
    scope: 'offline_access AgriculturalRecordRenewal',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44392',
      rootNamespace: 'AgriculturalRecordRenewal',
    },
  },
  apiUrl: 'https://localhost:44392/api',
} as Environment;
