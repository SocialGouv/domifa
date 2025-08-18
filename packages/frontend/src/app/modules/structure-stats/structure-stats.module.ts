import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  NgModule,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportingFormComponent } from "./components/reporting-form/reporting-form.component";
import { StructureStatsService } from "./services/structure-stats.service";
import { StructureStatsRoutingModule } from "./structure-stats-routing.module";
import { StuctureStatsComponent } from "./components/structure-stats/structure-stats.component";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [ReportingFormComponent, StuctureStatsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    StructureStatsRoutingModule,
    SharedModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
  ],
  providers: [
    StructureStatsService,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class StructureStatsModule {}
