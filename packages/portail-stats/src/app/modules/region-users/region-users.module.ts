import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { SharedModule } from "../shared/shared.module";
import { RegionUsersRoutingModule } from "./region-users-routing.module";
import { RegionUsersListComponent } from "./components/region-users-list/region-users-list.component";
import { RegisterRegionUserComponent } from "./components/register-region-user/register-region-user.component";
import { DeleteDepartmentUserComponent } from "./components/delete-department-user/delete-department-user.component";

@NgModule({
  declarations: [
    RegionUsersListComponent,
    RegisterRegionUserComponent,
    DeleteDepartmentUserComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    DsfrModalComponent,
    RegionUsersRoutingModule,
  ],
})
export class RegionUsersModule {}
