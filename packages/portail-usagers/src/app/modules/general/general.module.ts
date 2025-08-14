import { SharedModule } from "src/app/modules/shared/shared.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from "@angular/core";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { NotFoundComponent } from "./components/not-found/not-found.component";

import { RouterModule } from "@angular/router";
import { MentionsLegalesComponent } from "./components/_static/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./components/_static/politique/politique.component";
import { CguComponent } from "./components/_static/cgu/cgu.component";
import { RgaaComponent } from "./components/_static/rgaa/rgaa.component";
import { IdleManagerComponent } from "./components/idle-manager/idle-manager.component";
import { PlanSiteComponent } from "./components/_static/plan-site/plan-site.component";
import { FormsModule } from "@angular/forms";
import { NewsComponent } from "./components/_static/news/news.component";

@NgModule({
  declarations: [
    IdleManagerComponent,
    MentionsLegalesComponent,
    NotFoundComponent,
    CguComponent,
    PlanSiteComponent,
    PolitiqueComponent,
    RgaaComponent,
    NewsComponent,
  ],
  exports: [
    NotFoundComponent,
    IdleManagerComponent,
    PlanSiteComponent,
    CguComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    FontAwesomeModule,
    NgbModule,
    RouterModule.forChild([]),
    SharedModule,
    NgbModule,
    FormsModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class GeneralModule {}
