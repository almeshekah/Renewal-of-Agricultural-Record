import { Provider } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { NavItemsService } from '@abp/ng.theme.shared';

const menuItems = [
  {
    id: 'Dashboard',
    name: 'Dashboard',
    path: '/',
    icon: 'fas fa-home',
    order: 1,
  },
  {
    id: 'Administration',
    name: 'Administration',
    icon: 'fas fa-cog',
    order: 2,
    requiredPolicy: 'AbpIdentity.Roles || AbpIdentity.Users',
    items: [
      {
        id: 'Identity',
        name: 'Identity',
        icon: 'fas fa-users',
        order: 1,
        requiredPolicy: 'AbpIdentity.Roles || AbpIdentity.Users',
        items: [
          {
            id: 'Roles',
            name: 'Roles',
            path: '/identity/roles',
            icon: 'fas fa-user-tag',
            order: 1,
            requiredPolicy: 'AbpIdentity.Roles',
          },
          {
            id: 'Users',
            name: 'Users',
            path: '/identity/users',
            icon: 'fas fa-user',
            order: 2,
            requiredPolicy: 'AbpIdentity.Users',
          },
        ],
      },
      {
        id: 'TenantManagement',
        name: 'Tenant Management',
        path: '/tenant-management/tenants',
        icon: 'fas fa-building',
        order: 2,
        requiredPolicy: 'AbpTenantManagement.Tenants',
      },
    ],
  },
];

export function configureMenu(navItemsService: NavItemsService) {
  return () => {
    menuItems.forEach(item => {
      navItemsService.addItems([item]);
    });
    return Promise.resolve();
  };
}

export const MENU_PROVIDERS: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: configureMenu,
    deps: [NavItemsService],
    multi: true,
  },
];
