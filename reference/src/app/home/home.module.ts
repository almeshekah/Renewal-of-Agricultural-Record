import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ServicesLandingComponent } from './services-landing/services-landing.component';
import { ApplicationFormComponent } from './application-form/application-form.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		HomeComponent,
		ServicesLandingComponent,
		ApplicationFormComponent,
	],
	imports: [
		CommonModule,
		HomeRoutingModule,
		SharedModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
	],
	exports: [ApplicationFormComponent],
})
export class HomeModule {}
