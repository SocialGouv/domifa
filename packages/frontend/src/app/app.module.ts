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
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { LoadingComponent } from "./modules/loading/loading.component";
import { StructuresConfirmComponent } from "./modules/structures/components/structures-confirm/structures-confirm.component";
import { StructuresFormComponent } from "./modules/structures/components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./modules/structures/components/structures-search/structures-search.component";
import { UsagersFormComponent } from "./modules/usagers/components/form/usagers-form";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { UsagersProfilComponent } from "./modules/usagers/components/profil/profil-component";
import { LoginComponent } from "./modules/users/components/login/login.component";
import { RegisterUserComponent } from "./modules/users/components/register-user/register-user.component";
import { ResetPasswordComponent } from "./modules/users/components/reset-password/reset-password.component";
import { ServerErrorInterceptor } from "./services/server-error.interceptor";
import { DateFrDirective } from "./shared/date-fr.directive";
import { DigitOnlyDirective } from "./shared/digit-only.directive";

library.add(fas, far);

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HomeComponent,
    UsagersFormComponent,
    ManageUsagersComponent,
    UsagersProfilComponent,
    StructuresFormComponent,
    StructuresConfirmComponent,
    LoadingComponent,
    RegisterUserComponent,
    MentionsLegalesComponent,
    NotFoundComponent,
    StructuresSearchComponent,
    DigitOnlyDirective,
    DateFrDirective,
    LoginComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {}
