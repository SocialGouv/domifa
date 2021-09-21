import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAuthRoutingModule } from "./usager-auth-routing.module";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrModule } from "ngx-toastr";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [UsagerLoginComponent],
  imports: [
    CommonModule,
    UsagerAuthRoutingModule,
    ToastrModule.forRoot({}),
    HttpClientModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
})
export class UsagerAuthModule {}
