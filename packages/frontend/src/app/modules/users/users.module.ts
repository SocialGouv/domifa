import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";
import { RegisterUserAdminComponent } from "./components/register-user-admin/register-user-admin.component";
import { EditUserComponent } from "./components/edit-user/edit-user.component";

import { SharedModule } from "../shared/shared.module";
import { UsersRoutingModule } from "./users-routing.module";

@NgModule({
  declarations: [
    ResetPasswordComponent,
    UserProfilComponent,
    RegisterUserAdminComponent,
    EditUserComponent,
  ],
  exports: [
    ResetPasswordComponent,
    UserProfilComponent,
    RegisterUserAdminComponent,
    EditUserComponent,
  ],
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
