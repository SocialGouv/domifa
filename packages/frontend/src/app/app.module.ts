import { ManageUsagersModule } from "./modules/manage-usagers/manage-usagers.module";
import { LoadingService } from "./modules/shared/services/loading.service";

import { CustomToastService } from "./modules/shared/services/custom-toast.service";

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

import { environment } from "src/environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";

import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { GeneralModule } from "./modules/general/general.module";
import { AuthService } from "./modules/shared/services/auth.service";
import { SharedModule } from "./modules/shared/shared.module";

import pkg from "../../package.json";

import { UserIdleModule } from "angular-user-idle";

import { createErrorHandler, init } from "@sentry/angular";
import { MATOMO_INJECTORS } from "./shared";

const disableAnimations =
  !("animate" in document.documentElement) ||
  (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent));

if (environment.production) {
  init({
    release: "domifa@" + pkg.version,
    dsn: environment.sentryDsnFrontend,
    environment: environment.env,
    tracesSampleRate: 1.0,
  });
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule.withConfig({ disableAnimations }),
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    GeneralModule,
    NgbModule,
    SharedModule,
    ManageUsagersModule,
    UserIdleModule.forRoot({ idle: 10, timeout: 10, ping: 10 }),
    ...MATOMO_INJECTORS,
  ],
  providers: [
    AuthService,
    LoadingService,
    CustomToastService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      deps: [Router, AuthService],
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
    },
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: environment.production ? false : true,
      }),
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
