import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { SharedModule } from "../shared/shared.module";
import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./components/login-form/login.component";
import { ResetPasswordComponent } from "./components/reset-password-form/reset-password.component";
import { PasswordFormComponent } from "./components/password-form/password-form.component";
import { LoginContainerComponent } from "./components/login-container/login-container.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    LoginComponent,
    ResetPasswordComponent,
    PasswordFormComponent,
    LoginContainerComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AuthModule {}
