import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EmailTestComponent } from './email-test/email-test.component';

@NgModule({
  declarations: [EmailTestComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild([{ path: 'email-test', component: EmailTestComponent }]),
  ],
})
export class AdminModule {}
