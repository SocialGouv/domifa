import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from "@angular/core";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { CguComponent } from "./components/cgu/cgu.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";

import { HomeComponent } from "./components/home/home.component";
import { MentionsLegalesComponent } from "./components/mentions-legales/mentions-legales.component";

import { PolitiqueComponent } from "./components/politique/politique.component";
import { HomeService } from "./components/home/home.service";

import { RouterModule } from "@angular/router";

import { ToastrModule } from "ngx-toastr";

@NgModule({
  declarations: [
    HomeComponent,
    MentionsLegalesComponent,
    NotFoundComponent,

    CguComponent,
    PolitiqueComponent,
  ],
  exports: [NotFoundComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forChild([]),
    ToastrModule.forRoot(),
    NgbModule,
  ],
  providers: [HomeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class GeneralModule {}
