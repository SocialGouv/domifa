import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { StatsService } from "./components/services/stats.service";
import { StatsComponent } from "./components/structure-stats/structure-stats.component";

@NgModule({
  declarations: [DashboardComponent, StatsComponent],
  imports: [
    CommonModule,
    NgbModule,
    FontAwesomeModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [StatsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class StatsModule {}
