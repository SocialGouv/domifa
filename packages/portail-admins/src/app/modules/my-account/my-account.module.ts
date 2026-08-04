import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { SharedModule } from "../shared/shared.module";
import { MyAccountRoutingModule } from "./my-account-routing.module";
import { MyAccountComponent } from "./components/my-account/my-account.component";
import { UserSupervisorPasswordFormComponent } from "../admin-auth/components/user-structure-password-form/user-supervisor-password-form.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MyAccountRoutingModule,
    MyAccountComponent,
    UserSupervisorPasswordFormComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class MyAccountModule {}
