import { StatsRoutingModule } from "./stats-routing.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";

import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { StatsComponent } from "./components/stats/stats.component";
import { StatsService } from "./components/services/stats.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UsersModule } from "../users/users.module";

@NgModule({
  declarations: [DashboardComponent, StatsComponent],
  imports: [
    // StatsRoutingModule,
    CommonModule,
    NgbModule,
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-full-width",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 2000,
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [StatsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class StatsModule {}
