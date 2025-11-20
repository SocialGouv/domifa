import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { SharedModule } from "../shared/shared.module";
import { AdminAuthRoutingModule } from "./admin-auth-routing.module";
import { AdminLoginComponent } from "./components/admin-login-form/admin-login.component";
import { AdminAuthService } from "./services/admin-auth.service";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { ResetPasswordComponent } from "./components/reset-password-form/reset-password.component";
import { UserSupervisorPasswordFormComponent } from "./components/user-structure-password-form/user-supervisor-password-form.component";
import { LoginContainerComponent } from "./components/login-container/login-container.component";

@NgModule({
  declarations: [
    AdminLoginComponent,
    ResetPasswordComponent,
    UserSupervisorPasswordFormComponent,
    LoginContainerComponent,
  ],
  imports: [
    CommonModule,
    AdminAuthRoutingModule,
    FormsModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi()), AdminAuthService],
})
export class AdminAuthModule {}
