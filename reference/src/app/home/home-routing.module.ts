import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ServicesLandingComponent } from './services-landing/services-landing.component';
import { ApplicationFormComponent } from './application-form/application-form.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'services',
      },
      {
        path: 'services',
        component: ServicesLandingComponent,
      },
      {
        path: 'farm-renewal-application',
        component: ApplicationFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
