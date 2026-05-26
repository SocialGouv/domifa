import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DsfrDropdownMenuComponent,
  DsfrSpinnerComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { SharedModule } from "../shared/shared.module";
import { UsersComponent } from "./components/users/users.component";
import { StructureInfoComponent } from "./components/structure-info/structure-info.component";
import { FormatInternationalPhoneNumberPipe } from "../../shared/utils/formatInternationalPhoneNumber.pipe";
import { StructureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { StructureActivityComponent } from "./components/structure-activity/structure-activity.component";
import { StructureSecurityLogsComponent } from "./components/structure-security-logs/structure-security-logs.component";
import { StructureSessionsComponent } from "./components/structure-sessions/structure-sessions.component";
import { FormsModule } from "@angular/forms";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { StructureRoutingModule } from "./structure-routing.module";
import {
  DsfrButtonModule,
  DsfrButtonsGroupModule,
  DsfrModalModule,
  DsfrTooltipDirective,
} from "@edugouvfr/ngx-dsfr";
import { RegisterUserComponent } from "./components/register-user/register-user.component";
import { DisplayLastLoginComponent } from "../shared/components/display-last-login/display-last-login.component";
import { UsersTableComponent } from "../shared/components/users-table/users-table.component";
import { StructureFormRefuseComponent } from "../admin-structures/components/structure-form-refuse/structure-form-refuse.component";

@NgModule({
  declarations: [],
  imports: [
    StructureRoutingModule,
    CommonModule,
    FormsModule,
    FormatInternationalPhoneNumberPipe,
    SharedModule,
    ClipboardModule,
    DsfrTooltipDirective,
    RegisterUserComponent,
    DisplayLastLoginComponent,
    UsersTableComponent,
    DsfrSpinnerComponent,
    DsfrDropdownMenuComponent,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
    StructureFormRefuseComponent,
    UsersComponent,
    StructureInfoComponent,
    StructureStatsComponent,
    StructureActivityComponent,
    StructureSecurityLogsComponent,
    StructureSessionsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StructureModule {}
