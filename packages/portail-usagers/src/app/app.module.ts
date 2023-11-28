import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  LOCALE_ID,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";

import { SentryErrorHandler } from "./interceptors/sentry.interceptor";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UsagerAuthService } from "./modules/usager-auth/services/usager-auth.service";
import { SharedModule } from "./modules/shared/shared.module";
import { CustomToastService } from "./modules/shared/services/custom-toast.service";
import { GeneralModule } from "./modules/general/general.module";
import { MATOMO_INJECTORS } from "./shared";
import { provideUserIdleConfig } from "angular-user-idle";

import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";

registerLocaleData(localeFr, "fr");

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    GeneralModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    SharedModule,
    ReactiveFormsModule,
    MATOMO_INJECTORS,
  ],
  providers: [
    UsagerAuthService,
    CustomToastService,
    { provide: LOCALE_ID, useValue: "fr" },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    provideUserIdleConfig({ idle: 3600, timeout: 60, ping: 20 }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
