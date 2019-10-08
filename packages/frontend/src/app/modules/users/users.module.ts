import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPrintModule } from "ngx-print";
import { LoginComponent } from "./components/login/login.component";
import { RegisterUserComponent } from "./components/register-user/register-user.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";

@NgModule({
  declarations: [
    RegisterUserComponent,
    LoginComponent,
    ResetPasswordComponent,
    UserProfilComponent
  ],
  exports: [
    RegisterUserComponent,
    LoginComponent,
    ResetPasswordComponent,
    UserProfilComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    NgxPrintModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UsersModule {}
