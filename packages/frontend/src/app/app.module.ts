import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router, RouterModule } from "@angular/router";
import {
  FaIconLibrary,
  FontAwesomeModule
} from "@fortawesome/angular-fontawesome";

import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxHotjarModule } from "ngx-hotjar";
import { MatomoModule } from "ngx-matomo";
import { NgxPrintModule } from "ngx-print";
import { ToastrModule } from "ngx-toastr";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { GeneralModule } from "./modules/general/general.module";
import { StatsModule } from "./modules/stats/stats.module";
import { StructuresModule } from "./modules/structures/structures.module";
import { UsagersModule } from "./modules/usagers/usagers.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthService } from "./services/auth.service";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    StatsModule,
    GeneralModule,
    MatomoModule,
    UsagersModule,
    UsersModule,
    StructuresModule,
    BrowserModule,
    NgxPrintModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-full-width",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 3000
    }),
    AppRoutingModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxHotjarModule.forRoot("1350012")
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      deps: [Router, AuthService],
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {}
