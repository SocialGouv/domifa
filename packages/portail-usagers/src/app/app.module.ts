import { SharedModule } from "src/app/modules/shared/shared.module";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { MatomoModule } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { SentryErrorHandler } from "./interceptors/sentry.interceptor";
import { Router } from "@angular/router";
import { HealthCheckService } from "./modules/shared/services/health-check";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    MatomoModule,
    NgbModule,
    SharedModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-right",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 3000,
    }),
  ],
  providers: [
   
    {
      provide: ErrorHandler,
      useClass: SentryErrorHandler,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
