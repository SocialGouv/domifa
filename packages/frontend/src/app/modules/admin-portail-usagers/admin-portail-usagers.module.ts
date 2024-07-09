import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminPortailUsagersRoutingModule } from "./admin-portail-usagers-routing.module";
import { ManageTempMessagesComponent } from "./components/manage-temp-messages/manage-temp-messages.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { GeneralModule } from "../general/general.module";
import { SharedModule } from "../shared/shared.module";
import { AdminPortailUsagersMenuComponent } from "./components/admin-portail-usagers-menu/admin-portail-usagers-menu.component";
import { PortailUsagersParamsComponent } from "./components/portail-usagers-params/portail-usagers-params.component";

@NgModule({
  declarations: [
    ManageTempMessagesComponent,
    AdminPortailUsagersMenuComponent,
    PortailUsagersParamsComponent,
  ],
  imports: [
    CommonModule,
    AdminPortailUsagersRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    GeneralModule,
  ],
})
export class AdminPortailUsagersModule {}
