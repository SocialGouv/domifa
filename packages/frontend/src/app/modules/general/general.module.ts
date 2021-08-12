import { MatomoModule } from "ngx-matomo";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from "@angular/core";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ToastrModule } from "ngx-toastr";
import { LoadingComponent } from "../loading/loading.component";
import { LoadingService } from "../loading/loading.service";

import { CguComponent } from "./components/cgu/cgu.component";
import { NotFoundComponent } from "./components/errors/not-found/not-found.component";
import { FaqComponent } from "./components/faq/faq.component";
import { HomeComponent } from "./components/home/home.component";
import { MentionsLegalesComponent } from "./components/mentions/mentions-legales/mentions-legales.component";
import { NewsComponent } from "./components/news/news.component";
import { PolitiqueComponent } from "./components/politique/politique.component";
import { HomeService } from "./components/home/home.service";
import { CountUpModule } from "ngx-countup";
import { NavbarComponent } from "./components/navbar/navbar.component";

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
  ],
  exports: [LoadingComponent, NotFoundComponent, NavbarComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    CountUpModule,
    RouterModule.forRoot([], { relativeLinkResolution: "legacy" }),
    ToastrModule.forRoot(),
    HttpClientModule,
    NgbModule,
  ],
  providers: [LoadingService, HomeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class GeneralModule {}
