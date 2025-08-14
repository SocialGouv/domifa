import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SharedModule } from "../shared/shared.module";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";
import { UsersModule } from "../users/users.module";
import { RegisterUserSupervisorComponent } from "./components/register-user-supervisor/register-user-supervisor.component";
import { ManageUsersRoutingModule } from "./manage-users-routing.module";
import { DeleteUserComponent } from "./components/delete-user/delete-user.component";
import { FullNamePipe, SortArrayPipe } from "../shared/pipes";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

@NgModule({
  declarations: [
    UserProfilComponent,
    RegisterUserSupervisorComponent,
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
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class ManageUsersModule {}
