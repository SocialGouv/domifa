import { StatsModule } from "./modules/stats/stats.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import * as Sentry from "@sentry/browser";
import { CountUpModule } from "ngx-countup";
import { MatomoModule } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { SentryErrorHandler } from "./interceptors/sentry.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { GeneralModule } from "./modules/general/general.module";
import { AuthService } from "./modules/shared/services/auth.service";
import { HealthCheckService } from "./modules/shared/services/health-check";
import { SharedModule } from "./modules/shared/shared.module";

import { StructuresModule } from "./modules/structures/structures.module";
import { UsagersModule } from "./modules/usagers/usagers.module";
import { UsersModule } from "./modules/users/users.module";
import { UsagerSharedModule } from "./modules/usager-shared/usager-shared.module";
import { NgxChartsModule } from "@swimlane/ngx-charts";

if (environment.production) {
  Sentry.init({
    dsn: "https://5dab749719e9488798341efad0947291@sentry.fabrique.social.gouv.fr/31",
  });
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    UsagerSharedModule,
    BrowserAnimationsModule,
    FormsModule,
    MatomoModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    GeneralModule,
    StatsModule,
    HttpClientModule,
    MatomoModule,
    NgbModule,
    SharedModule,
    StructuresModule,
    NgxChartsModule,
    UsagersModule,
    CountUpModule,
    UsersModule,
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-left",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 4000,
    }),
  ],
  providers: [
    AuthService,
    HealthCheckService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      deps: [Router, AuthService],
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
