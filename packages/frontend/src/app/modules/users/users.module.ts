import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";

import { SharedModule } from "../shared/shared.module";
import { UserStructurePasswordFormComponent } from "./components/user-structure-password-form/user-structure-password-form.component";
import { UsersRoutingModule } from "./users-routing.module";

@NgModule({
  declarations: [ResetPasswordComponent, UserStructurePasswordFormComponent],
  exports: [UserStructurePasswordFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    UsersRoutingModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class UsersModule {}
