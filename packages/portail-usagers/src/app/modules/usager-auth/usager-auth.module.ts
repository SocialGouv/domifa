import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "../shared/shared.module";
import { UsagerAuthService } from "./services/usager-auth.service";

import { UsagerAuthRoutingModule } from "./usager-auth-routing.module";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";
import { UppercaseDirective } from "../shared/directives/uppercase.directive";

@NgModule({
  declarations: [UsagerLoginComponent],
  imports: [
    CommonModule,
    UsagerAuthRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    UppercaseDirective,
  ],
  providers: [UsagerAuthService, provideHttpClient(withInterceptorsFromDi())],
})
export class UsagerAuthModule {}
