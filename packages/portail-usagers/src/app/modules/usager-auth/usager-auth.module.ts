import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { NgModule } from "@angular/core";

import { UsagerAuthService } from "./services/usager-auth.service";

import { UsagerAuthRoutingModule } from "./usager-auth-routing.module";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";

@NgModule({
  imports: [UsagerAuthRoutingModule, UsagerLoginComponent],
  providers: [UsagerAuthService, provideHttpClient(withInterceptorsFromDi())],
})
export class UsagerAuthModule {}
