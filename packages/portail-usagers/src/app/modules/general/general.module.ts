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

import { NotFoundComponent } from "./components/not-found/not-found.component";

import { RouterModule } from "@angular/router";
import { MentionsLegalesComponent } from "./components/_static/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./components/_static/politique/politique.component";
import { CguComponent } from "./components/_static/cgu/cgu.component";
import { RgaaComponent } from "./components/_static/rgaa/rgaa.component";
import { IdleManagerComponent } from "./components/idle-manager/idle-manager.component";
import { PlanSiteComponent } from "./components/_static/plan-site/plan-site.component";
import { NewsComponent } from "./components/_static/news/news.component";

@NgModule({
  exports: [
    NotFoundComponent,
    IdleManagerComponent,
    PlanSiteComponent,
    CguComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    NotFoundComponent,
    IdleManagerComponent,
    MentionsLegalesComponent,
    CguComponent,
    PlanSiteComponent,
    PolitiqueComponent,
    RgaaComponent,
    NewsComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class GeneralModule {}
