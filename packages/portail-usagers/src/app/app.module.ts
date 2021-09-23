import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { MatomoModule } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { SentryErrorHandler } from "./interceptors/sentry.interceptor";
import { Router } from "@angular/router";
import { HealthCheckService } from "./modules/shared/services/health-check";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    MatomoModule,
    NgbModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
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
    HealthCheckService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      deps: [Router],
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {
  constructo(library: FaIconLibrary) {
    library.addIcons(faEye);
  }
}
