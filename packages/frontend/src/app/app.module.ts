import { LoadingService } from "./modules/shared/services/loading.service";

import { CustomToastService } from "./modules/shared/services/custom-toast.service";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  LOCALE_ID,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

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

import { createErrorHandler, init } from "@sentry/angular";
import { MATOMO_INJECTORS } from "./shared";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "./shared/store/ngRxAppStore.service";
import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { provideUserIdleConfig } from "angular-user-idle";

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

registerLocaleData(localeFr, "fr");
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
    StoreModule.forRoot({ app: _usagerReducer }),
    SharedModule,
    MATOMO_INJECTORS,
  ],
  providers: [
    AuthService,
    LoadingService,
    CustomToastService,
    provideUserIdleConfig({ idle: 3600, timeout: 60, ping: 20 }),
    { provide: LOCALE_ID, useValue: "fr" },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      useClass: ServerErrorInterceptor,
      multi: true,
      provide: HTTP_INTERCEPTORS,
    },
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: !environment?.production,
      }),
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
