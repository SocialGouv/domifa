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
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "src/app/modules/shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { CustomToastService } from "./modules/shared/services/custom-toast.service";
import { GeneralModule } from "./modules/general/general.module";
import { createErrorHandler, init } from "@sentry/angular-ivy";
import { environment } from "../environments/environment";
import pkg from "../../package.json";
import { MATOMO_INJECTORS } from "./shared/MATOMO_INJECTORS.const";

const disableAnimations =
  !("animate" in document.documentElement) ||
  (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent));

if (environment.production) {
  init({
    release: "domifa@" + pkg.version,
    dsn: environment.sentryDsnPortailAdmin,
    environment: environment.env,
    tracesSampleRate: 1.0,
  });
}
@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule.withConfig({ disableAnimations }),
    GeneralModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    SharedModule,
    ReactiveFormsModule,
    MATOMO_INJECTORS,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
    },
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: !environment?.production,
      }),
    },
    CustomToastService,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
