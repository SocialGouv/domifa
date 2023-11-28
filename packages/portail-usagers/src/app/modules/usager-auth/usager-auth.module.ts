import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { SharedModule } from "../shared/shared.module";
import { UsagerAuthService } from "./services/usager-auth.service";

import { UsagerAuthRoutingModule } from "./usager-auth-routing.module";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";

@NgModule({
  declarations: [UsagerLoginComponent],
  imports: [
    CommonModule,
    UsagerAuthRoutingModule,
    HttpClientModule,
    FormsModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [UsagerAuthService],
})
export class UsagerAuthModule {}
