import { IdleManagerComponent } from "./components/static-modals/idle-manager/idle-manager.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from "@angular/core";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { LoadingComponent } from "../shared/components/loading/loading.component";

import { CguComponent } from "./components/static-pages/cgu/cgu.component";
import { NotFoundComponent } from "./components/errors/not-found/not-found.component";
import { FaqComponent } from "./components/faq/faq.component";
import { HomeComponent } from "./components/home/home.component";
import { MentionsLegalesComponent } from "./components/static-pages/mentions-legales/mentions-legales.component";
import { NewsComponent } from "./components/news/news.component";
import { PolitiqueComponent } from "./components/static-pages/politique/politique.component";
import { GeneralService } from "./services/general.service";

import { NavbarComponent } from "./components/navbar/navbar.component";
import { RouterModule } from "@angular/router";

import { SharedModule } from "../shared/shared.module";
import { LoginComponent } from "./components/login/login.component";
import { PlanSiteComponent } from "./components/plan-site/plan-site.component";
import { HelpModalComponent } from "./components/static-modals/help-modal/help-modal.component";
import { RgaaComponent } from "./components/static-pages/rgaa/rgaa.component";
import { LandingPagePortailComponent } from "./components/static-pages/landing-page-portail/landing-page-portail.component";
import { HomeStatsComponent } from "../stats/components/home-stats/home-stats.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [
    HomeComponent,
    LoadingComponent,
    MentionsLegalesComponent,
    NotFoundComponent,
    FaqComponent,
    NewsComponent,
    CguComponent,
    PolitiqueComponent,
    NavbarComponent,
    LoginComponent,
    PlanSiteComponent,
    HelpModalComponent,
    IdleManagerComponent,
    RgaaComponent,
    LandingPagePortailComponent,
  ],
  exports: [
    LoadingComponent,
    NotFoundComponent,
    NavbarComponent,
    CguComponent,
    HelpModalComponent,
    IdleManagerComponent,
    LandingPagePortailComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    RouterModule.forChild([]),
    NgbModule,
    FontAwesomeModule,
    HomeStatsComponent,
  ],
  providers: [GeneralService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class GeneralModule {}
