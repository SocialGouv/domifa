import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ClipboardModule } from "@angular/cdk/clipboard";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
  DsfrSpinnerComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import {
  DsfrButtonModule,
  DsfrButtonsGroupModule,
  DsfrModalModule,
} from "@edugouvfr/ngx-dsfr";

import { SharedModule } from "../shared/shared.module";
import { UsersTableComponent } from "../shared/components/users-table/users-table.component";

import { ManageStructureUsersRoutingModule } from "./manage-structure-users-routing.module";
import { StructureUserActivityComponent } from "./components/structure-user-activity/structure-user-activity.component";
import { StructureUserDetailContainerComponent } from "./components/structure-user-detail-container/structure-user-detail-container.component";
import { StructureUserInfoComponent } from "./components/structure-user-info/structure-user-info.component";
import { StructureUsersListComponent } from "./components/structure-users-list/structure-users-list.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ClipboardModule,
    SharedModule,
    ManageStructureUsersRoutingModule,
    UsersTableComponent,
    DsfrSpinnerComponent,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    StructureUsersListComponent,
    StructureUserDetailContainerComponent,
    StructureUserInfoComponent,
    StructureUserActivityComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ManageStructureUsersModule {}
