import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
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
import { UserIdleModule } from "angular-user-idle";

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
    ...MATOMO_INJECTORS,
    UserIdleModule.forRoot({ idle: 30, timeout: 30, ping: 10 }),
  ],
  providers: [
    UsagerAuthService,
    CustomToastService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },

    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
