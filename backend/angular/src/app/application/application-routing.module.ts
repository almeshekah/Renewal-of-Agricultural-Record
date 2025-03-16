import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ApplicationListComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: ':id',
    component: ApplicationDetailsComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'new',
    component: ApplicationFormComponent,
  },
  // canActivate: [AuthGuard],
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationRoutingModule {}
