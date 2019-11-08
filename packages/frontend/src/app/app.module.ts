import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { NgxPrintModule } from "ngx-print";
import { ToastrModule } from "ngx-toastr";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { GeneralModule } from "./modules/general/general.module";
import { StructuresModule } from "./modules/structures/structures.module";
import { UsagersModule } from "./modules/usagers/usagers.module";
import { UsersModule } from "./modules/users/users.module";

library.add(fas, far);

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
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
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {}
