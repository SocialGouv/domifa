import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";

import { ManageUsagersTableComponent } from "./components/manage/manage-usagers-table/manage-usagers-table.component";
import { ManageUsagersComponent } from "./components/manage/manage.component";

import { ManageUsagersRoutingModule } from "./manage-usagers-routing.module";

@NgModule({
  declarations: [ManageUsagersComponent, ManageUsagersTableComponent],
  imports: [
    CommonModule,
    FormsModule,
    UsagerSharedModule,
    HttpClientModule,
    NgbModule,
    SharedModule,
    UsersModule,
    ManageUsagersRoutingModule,
  ],
})
export class ManageUsagersModule {}
