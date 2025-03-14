import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationDataService } from '../shared/services/application-data.service';
import { AgriculturalRecordRenewalComponent } from './components/agricultural-record-renewal/agricultural-record-renewal.component';

@NgModule({
  declarations: [AgriculturalRecordRenewalComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  providers: [ApplicationDataService],
  exports: [AgriculturalRecordRenewalComponent],
})
export class ApplicationsModule {}
