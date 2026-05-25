import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SharedModule } from "../shared/shared.module";
import { SupervisorListComponent } from "./components/user-supervisor-list/supervisor-list.component";
import { RegisterUserSupervisorComponent } from "./components/register-user-supervisor/register-user-supervisor.component";
import { ManageUsersRoutingModule } from "./manage-users-routing.module";
import { DeleteUserComponent } from "./components/delete-user/delete-user.component";
import { SupervisorActivityComponent } from "./components/supervisor-activity/supervisor-activity.component";
import { SupervisorDetailContainerComponent } from "./components/supervisor-detail-container/supervisor-detail-container.component";
import { SupervisorInfoComponent } from "./components/supervisor-info/supervisor-info.component";
import { SupervisorSessionsComponent } from "./components/supervisor-sessions/supervisor-sessions.component";
import { FullNamePipe, SortArrayPipe } from "../shared/pipes";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { DisplayLastLoginComponent } from "../shared/components/display-last-login/display-last-login.component";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
  DsfrSpinnerComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { DsfrModalModule } from "@edugouvfr/ngx-dsfr";

@NgModule({
  declarations: [],
  imports: [
    TableHeadSortComponent,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    ManageUsersRoutingModule,
    FullNamePipe,
    SortArrayPipe,
    DisplayLastLoginComponent,
    DsfrSpinnerComponent,
    DsfrModalModule,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    SupervisorListComponent,
    RegisterUserSupervisorComponent,
    DeleteUserComponent,
    SupervisorDetailContainerComponent,
    SupervisorInfoComponent,
    SupervisorActivityComponent,
    SupervisorSessionsComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class ManageUsersModule {}
