import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { SpecialistReviewComponent } from './components/specialist-review/specialist-review.component';
import { ManagerReviewComponent } from './components/manager-review/manager-review.component';
import { CooReviewComponent } from './components/coo-review/coo-review.component';
import { WorkflowTestComponent } from './components/workflow-test/workflow-test.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicationListComponent,
  },
  {
    path: 'new',
    component: ApplicationFormComponent,
  },
  {
    path: 'detail/:id',
    component: ApplicationDetailComponent,
  },
  {
    path: 'review/:id/specialist',
    component: SpecialistReviewComponent,
  },
  {
    path: 'review/:id/manager',
    component: ManagerReviewComponent,
  },
  {
    path: 'review/:id/coo',
    component: CooReviewComponent,
  },
  {
    path: 'workflow-test',
    component: WorkflowTestComponent,
  },
  {
    path: ':id',
    component: ApplicationDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationRoutingModule {}
