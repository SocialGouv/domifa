import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { SharedModule } from "../shared/shared.module";
import { UsagerAuthService } from "./services/usager-auth.service";

import { UsagerAuthRoutingModule } from "./usager-auth-routing.module";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";
import { UsagerAcceptCguComponent } from "./usager-accept-cgu/usager-accept-cgu.component";
import { GeneralModule } from "../general/general.module";

@NgModule({
  declarations: [UsagerLoginComponent, UsagerAcceptCguComponent],
  imports: [
    CommonModule,
    UsagerAuthRoutingModule,
    HttpClientModule,
    FormsModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
    GeneralModule,
  ],
  providers: [UsagerAuthService],
})
export class UsagerAuthModule {}
