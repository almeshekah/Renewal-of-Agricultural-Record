import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ApplicationRoutingModule } from './application-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';
import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationService } from './services/application.service';
import { WorkflowService } from './services/workflow.service';

@NgModule({
  declarations: [ApplicationListComponent, ApplicationDetailsComponent, ApplicationFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ApplicationRoutingModule,
    SharedModule,
  ],
  providers: [ApplicationService, WorkflowService],
})
export class ApplicationModule {}
