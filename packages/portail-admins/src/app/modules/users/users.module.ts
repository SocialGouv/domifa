import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";

import { SharedModule } from "../shared/shared.module";
import { UserSupervisorPasswordFormComponent } from "./components/user-structure-password-form/user-supervisor-password-form.component";
import { UsersRoutingModule } from "./users-routing.module";

@NgModule({
  declarations: [ResetPasswordComponent, UserSupervisorPasswordFormComponent],
  exports: [UserSupervisorPasswordFormComponent],
  imports: [
    FormsModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    UsersRoutingModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersModule {}
