import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminPortailUsagersRoutingModule } from "./admin-portail-usagers-routing.module";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { GeneralModule } from "../general/general.module";
import { SharedModule } from "../shared/shared.module";
import { AdminPortailUsagersMenuComponent } from "./components/admin-portail-usagers-menu/admin-portail-usagers-menu.component";
import { PortailUsagersParamsComponent } from "./components/portail-usagers-params/portail-usagers-params.component";
import { ManageStructureInformationComponent } from "./components/manage-structure-information/manage-structure-information.component";
import { ManageStructureInformationFormComponent } from "./components/manage-structure-information-form/manage-structure-information-form.component";
import { StructureInformationService } from "./services/structure-information.service";
import { ManagePortailUsagersService } from "./services/manage-portail-usagers.service";

import { ManageUserUsagerComponent } from "./components/manage-user-usager/manage-user-usager.component";
import { DsfrEditorComponent } from "@edugouvfr/ngx-dsfr-ext/editor";
import {
  DsfrModalComponent,
  DsfrPaginationComponent,
} from "@edugouvfr/ngx-dsfr";
import { DisplayLastLoginComponent } from "../shared/components/display-last-login/display-last-login.component";
import { DsfrDatePickerComponent } from "@edugouvfr/ngx-dsfr-ext";

@NgModule({
  declarations: [
    AdminPortailUsagersMenuComponent,
    PortailUsagersParamsComponent,
    ManageStructureInformationComponent,
    ManageStructureInformationFormComponent,
    ManageUserUsagerComponent,
  ],
  imports: [
    CommonModule,
    AdminPortailUsagersRoutingModule,
    FormsModule,

    ReactiveFormsModule,
    SharedModule,
    GeneralModule,
    DsfrDatePickerComponent,
    DsfrEditorComponent,
    DsfrModalComponent,
    DisplayLastLoginComponent,
    DsfrPaginationComponent,
  ],
  providers: [
    StructureInformationService,
    ManagePortailUsagersService,

    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AdminPortailUsagersModule {}
