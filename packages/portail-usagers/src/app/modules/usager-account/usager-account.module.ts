import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsagerAccountRoutingModule } from './usager-account-routing.module';
import { HomeUsagerComponent } from './home-usager/home-usager.component';
import { SectionInfosComponent } from './section-infos/section-infos.component';


@NgModule({
  declarations: [
    HomeUsagerComponent,
    SectionInfosComponent
  ],
  imports: [
    CommonModule,
    UsagerAccountRoutingModule
  ]
})
export class UsagerAccountModule { }
