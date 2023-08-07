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
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "src/app/modules/shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { SentryErrorHandler } from "./interceptors/sentry.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { AdminAuthService } from "./modules/admin-auth/services/admin-auth.service";
import { CustomToastService } from "./modules/shared/services/custom-toast.service";
import { GeneralModule } from "./modules/general/general.module";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    GeneralModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      deps: [Router, AdminAuthService],
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    CustomToastService,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
