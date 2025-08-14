import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { SharedModule } from "../shared/shared.module";
import { AdminAuthRoutingModule } from "./admin-auth-routing.module";
import { AdminLoginComponent } from "./admin-login/admin-login.component";
import { AdminAuthService } from "./services/admin-auth.service";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

@NgModule({
  declarations: [AdminLoginComponent],
  imports: [
    CommonModule,
    AdminAuthRoutingModule,
    FormsModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi()), AdminAuthService],
})
export class AdminAuthModule {}
