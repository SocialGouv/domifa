import { SharedModule } from "src/app/modules/shared/shared.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from "@angular/core";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { NotFoundComponent } from "./components/not-found/not-found.component";

import { HomeComponent } from "./components/home/home.component";

import { RouterModule } from "@angular/router";
import { MentionsLegalesComponent } from "./components/_static/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./components/_static/politique/politique.component";
import { CguComponent } from "./components/_static/cgu/cgu.component";
import { RgaaComponent } from './components/_static/rgaa/rgaa.component';

@NgModule({
  declarations: [
    HomeComponent,
    MentionsLegalesComponent,
    NotFoundComponent,
    CguComponent,
    PolitiqueComponent,
    RgaaComponent,
  ],
  exports: [NotFoundComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    NgbModule,
    RouterModule.forChild([]),
    SharedModule,
    NgbModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class GeneralModule {}
