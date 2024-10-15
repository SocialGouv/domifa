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
import { UserStructurePasswordFormComponent } from "./components/user-structure-password-form/user-structure-password-form.component";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../shared/pipes";

@NgModule({
  declarations: [
    ResetPasswordComponent,
    UserProfilComponent,
    RegisterUserAdminComponent,
    EditUserComponent,
    UserStructurePasswordFormComponent,
  ],
  exports: [UserStructurePasswordFormComponent],
  imports: [
    TableHeadSortComponent,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    UsersRoutingModule,
    SortArrayPipe,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersModule {}
