import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminPortailUsagersRoutingModule } from "./admin-portail-usagers-routing.module";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { GeneralModule } from "../general/general.module";
import { SharedModule } from "../shared/shared.module";
import { AdminPortailUsagersMenuComponent } from "./components/admin-portail-usagers-menu/admin-portail-usagers-menu.component";
import { PortailUsagersParamsComponent } from "./components/portail-usagers-params/portail-usagers-params.component";
import { ManageStructureInformationComponent } from "./components/manage-structure-information/manage-structure-information.component";
import { ManageStructureInformationFormComponent } from "./components/manage-structure-information-form/manage-structure-information-form.component";
import { StructureInformationService } from "./services/structure-information.service";
import { ManagePortailUsagersService } from "./services/manage-portail-usagers.service";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
} from "../shared/services";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ManageUserUsagerComponent } from "./components/manage-user-usager/manage-user-usager.component";
import { DsfrEditorComponent } from "@edugouvfr/ngx-dsfr-ext/editor";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { DisplayLastLoginComponent } from "../shared/components/display-last-login/display-last-login.component";

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
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    GeneralModule,
    FontAwesomeModule,
    DsfrEditorComponent,
    DsfrModalComponent,
    DisplayLastLoginComponent,
  ],
  providers: [
    StructureInformationService,
    ManagePortailUsagersService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AdminPortailUsagersModule {}
