import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminAuthRoutingModule } from "./auth.routing.module";
import { LoginContainerComponent } from "./components/login-container/login-container.component";
import { LoginFormComponent } from "./components/login/login-form.component";
import { RenewPasswordComponent } from "./components/renew-password/renew-password.component";
import { SharedModule } from "../shared/shared.module";
import { ResetPasswordComponent } from "../users/components/reset-password/reset-password.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    LoginContainerComponent,
    LoginFormComponent,
    RenewPasswordComponent,
    ResetPasswordComponent,
  ],
  exports: [LoginContainerComponent],
  imports: [
    SharedModule,
    AdminAuthRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AuthModule {}
