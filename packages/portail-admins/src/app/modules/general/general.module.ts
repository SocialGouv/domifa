import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { PlanSiteComponent } from "./components/static-pages/plan-site/plan-site.component";
import { CguComponent } from "./components/static-pages/cgu/cgu.component";
import { PolitiqueComponent } from "./components/static-pages/politique/politique.component";
import { MentionsLegalesComponent } from "./components/static-pages/mentions-legales/mentions-legales.component";

@NgModule({
  declarations: [
    NotFoundComponent,
    PlanSiteComponent,
    CguComponent,
    PolitiqueComponent,
    MentionsLegalesComponent,
  ],
  exports: [NotFoundComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    NgbModule,
    RouterModule.forChild([]),
    NgbModule,
    SharedModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class GeneralModule {}
