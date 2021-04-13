import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ToastrModule } from "ngx-toastr";
import { LoginComponent } from "./components/login/login.component";

import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";
import { UsersService } from "./services/users.service";
import { RegisterUserAdminComponent } from "./components/register-user-admin/register-user-admin.component";
import { EditUserComponent } from "./components/edit-user/edit-user.component";

import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    UserProfilComponent,
    RegisterUserAdminComponent,
    EditUserComponent,
  ],
  exports: [
    LoginComponent,
    ResetPasswordComponent,
    UserProfilComponent,
    RegisterUserAdminComponent,
    EditUserComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-full-width",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 2000,
    }),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [UsersService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersModule {}
