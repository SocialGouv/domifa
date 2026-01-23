import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../shared/shared.module";
import { UsersRoutingModule } from "./users-routing.module";

@NgModule({
  declarations: [],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    UsersRoutingModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class UsersModule {}
