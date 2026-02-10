import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { FullNamePipe, SortArrayPipe } from "../shared/pipes";
import { SharedModule } from "../shared/shared.module";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";
import { UsersModule } from "../users/users.module";
import { RegisterUserAdminComponent } from "./components/register-user-admin/register-user-admin.component";
import { ManageUsersRoutingModule } from "./manage-users-routing.module";
import { AssignReferrersComponent } from "./components/assign-referrers/assign-referrers.component";
import { DeleteUserComponent } from "./components/delete-user/delete-user.component";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { DisplayLastLoginComponent } from "src/app/modules/shared/components/display-last-login/display-last-login.component";

@NgModule({
  declarations: [
    UserProfilComponent,
    EditUserComponent,
    RegisterUserAdminComponent,
    AssignReferrersComponent,
    DeleteUserComponent,
  ],
  imports: [
    TableHeadSortComponent,
    FormsModule,
    NgbModule,
    UsersModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    ManageUsersRoutingModule,
    FullNamePipe,
    SortArrayPipe,
    DsfrModalComponent,
    DisplayLastLoginComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class ManageUsersModule {}
