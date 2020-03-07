import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";
import { StructuresModule } from "../structures/structures.module";
import { UsersModule } from "../users/users.module";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { RapportComponent } from "./components/rapport/rapport.component";
import { StatsService } from "./stats.service";

@NgModule({
  declarations: [DashboardComponent, RapportComponent],
  exports: [DashboardComponent],
  imports: [
    UsersModule,
    StructuresModule,
    CommonModule,
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-full-width",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 2000
    }),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [StatsService]
})
export class StatsModule {}
