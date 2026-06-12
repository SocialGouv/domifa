import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
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
import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "./interceptors/server-error.interceptor";
import { CustomToastService } from "./modules/shared/services/custom-toast.service";
import { GeneralModule } from "./modules/general/general.module";
import { OtpModalComponent } from "./modules/otp/components/otp-modal/otp-modal.component";
import { OtpInterceptor } from "./modules/otp/interceptors/otp.interceptor";
import { createErrorHandler, init } from "@sentry/angular";
import { environment } from "../environments/environment";
import pkg from "../../package.json";
import { MATOMO_INJECTORS } from "./shared";
import { AdminAuthService } from "./modules/admin-auth/services/admin-auth.service";
import {
  DsfrFooterModule,
  DsfrHeaderModule,
  DsfrSkiplinksModule,
} from "@edugouvfr/ngx-dsfr";
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import {
  structuresFeature,
  StructuresEffects,
  supervisorsFeature,
  SupervisorsEffects,
  usersFeature,
  UsersEffects,
} from "./modules/shared/store";

const disableAnimations =
  !("animate" in document.documentElement) ||
  (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent));

if (environment.production) {
  init({
    release: `domifa@${pkg.version}`,
    dsn: environment.sentryDsnPortailAdmin,
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
    BrowserAnimationsModule.withConfig({ disableAnimations }),
    GeneralModule,
    BrowserModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    MATOMO_INJECTORS,
    OtpModalComponent,
    DsfrFooterModule,
    DsfrHeaderModule,
    DsfrSkiplinksModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({
      [structuresFeature.name]: structuresFeature.reducer,
      [usersFeature.name]: usersFeature.reducer,
      [supervisorsFeature.name]: supervisorsFeature.reducer,
    }),
    provideEffects([StructuresEffects, UsersEffects, SupervisorsEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
    }),
    { provide: LOCALE_ID, useValue: "fr" },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    // OtpInterceptor must come AFTER ServerErrorInterceptor so it sits closer
    // to the backend in the chain. Angular runs error catchers innermost-first,
    // so OTP gets first crack at 401/429 and only non-OTP errors fall through
    // to ServerErrorInterceptor (which logs out on any 401).
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
    },
    { provide: HTTP_INTERCEPTORS, useClass: OtpInterceptor, multi: true },
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: !environment?.production,
      }),
    },
    AdminAuthService,
    CustomToastService,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
