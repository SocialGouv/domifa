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
import { HttpErrorInterceptor } from "./modules/interceptors/errors.interceptor";
import { LoadingComponent } from "./modules/loading/loading.component";
import { StructuresFormComponent } from "./modules/structures/components/structures-form/structures-form.component";
import { UsagersFormComponent } from "./modules/usagers/components/form/usagers-form";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { UsagersProfilComponent } from "./modules/usagers/components/profil/profil-component";
import { RegisterUserComponent } from "./modules/users/components/register-user/register-user.component";

// Add an icon to the library for convenient access in other components
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
    LoadingComponent,
    RegisterUserComponent,
    MentionsLegalesComponent,
    NotFoundComponent
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
      useClass: HttpErrorInterceptor
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {}
