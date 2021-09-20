import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsagerAccountRoutingModule } from './usager-account-routing.module';
import { HomeUsagerComponent } from './home-usager/home-usager.component';


@NgModule({
  declarations: [
    HomeUsagerComponent
  ],
  imports: [
    CommonModule,
    UsagerAccountRoutingModule
  ]
})
export class UsagerAccountModule { }
