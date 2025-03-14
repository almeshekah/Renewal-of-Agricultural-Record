import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  development: true,
  useMockAuth: true,
  application: {
    baseUrl,
    name: 'AgriculturalRecordRenewal',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44390/',
    redirectUri: baseUrl,
    clientId: 'AgriculturalRecordRenewal_App',
    responseType: 'code',
    scope: 'offline_access AgriculturalRecordRenewal',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44390',
      rootNamespace: 'AgriculturalRecordRenewal',
    },
  },
} as Environment;
