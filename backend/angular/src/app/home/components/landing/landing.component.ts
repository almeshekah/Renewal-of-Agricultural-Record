import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  services: Service[] = [
    {
      id: 1,
      title: 'Agricultural Record Renewal',
      description:
        'Renew your agricultural record quickly and efficiently through our online service.',
      icon: 'bi bi-file-earmark-text',
      route: '/applications/agricultural-record-renewal',
    },
    {
      id: 2,
      title: 'New Agricultural Registration',
      description:
        'Register a new agricultural activity with comprehensive documentation and support.',
      icon: 'bi bi-plus-circle',
      route: '/login',
    },
    {
      id: 3,
      title: 'Agricultural Permits',
      description:
        'Apply for various agricultural permits and licenses through our streamlined process.',
      icon: 'bi bi-card-checklist',
      route: '/login',
    },
    {
      id: 4,
      title: 'Technical Support',
      description: 'Get expert technical support for all your agricultural service needs.',
      icon: 'bi bi-headset',
      route: '/login',
    },
  ];

  constructor(private router: Router) {}

  navigateToService(serviceId: number): void {
    const service = this.services.find(s => s.id === serviceId);
    if (service) {
      this.router.navigate([service.route]);
    }
  }

  switchLanguage(): void {
    // TODO: Implement language switching logic
    console.log('Switching language...');
  }
}
