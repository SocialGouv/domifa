
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from './modules/auth/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import { HttpErrorInterceptor } from './modules/interceptors/errors.interceptor';
import { StructuresFormComponent } from './modules/structures/components/structures-form/structures-form.component';
import { UsagersFormComponent } from './modules/usagers/components/form/usagers-form';
import { ManageUsagersComponent } from './modules/usagers/components/manage/manage.component';
import { UsagersProfilComponent } from './modules/usagers/components/profil/profil-component';
import { UsersComponent } from './modules/users/components/register /users.controller';

// Add an icon to the library for convenient access in other components
library.add(fas, far);

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, LoginComponent, HomeComponent, UsagersFormComponent, UsersComponent, ManageUsagersComponent,UsagersProfilComponent, StructuresFormComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,

  ],
  providers: [{
    multi: true,
    provide: HTTP_INTERCEPTORS,
    useClass: HttpErrorInterceptor,
  }],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ]
})
export class AppModule {}
