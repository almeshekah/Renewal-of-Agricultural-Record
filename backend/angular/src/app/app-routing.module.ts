import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { LandingComponent } from './home/components/landing/landing.component';
import { AgriculturalRecordRenewalComponent } from './applications/components/agricultural-record-renewal/agricultural-record-renewal.component';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'applications/agricultural-record-renewal',
    component: AgriculturalRecordRenewalComponent,
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'application',
    loadChildren: () => import('./application/application.module').then(m => m.ApplicationModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    // canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
