import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";
import { AdminAuthRoutingModule } from "./admin-auth-routing.module";
import { AdminLoginComponent } from "./admin-login/admin-login.component";
import { AdminAuthService } from "./services/admin-auth.service";

@NgModule({
  declarations: [AdminLoginComponent],
  imports: [
    CommonModule,
    AdminAuthRoutingModule,
    ToastrModule.forRoot({}),
    HttpClientModule,
    FormsModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
