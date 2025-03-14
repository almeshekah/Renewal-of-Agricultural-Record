import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { SpecialistReviewComponent } from './components/specialist-review/specialist-review.component';
import { ManagerReviewComponent } from './components/manager-review/manager-review.component';
import { CooReviewComponent } from './components/coo-review/coo-review.component';
import { WorkflowActionsComponent } from './components/workflow-actions/workflow-actions.component';
import { WorkflowTestComponent } from './components/workflow-test/workflow-test.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ApplicationListComponent,
    ApplicationFormComponent,
    ApplicationDetailComponent,
    SpecialistReviewComponent,
    ManagerReviewComponent,
    CooReviewComponent,
    WorkflowActionsComponent,
    WorkflowTestComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    HttpClientModule,
    ApplicationRoutingModule,
    SharedModule,
  ],
})
export class ApplicationModule {}
