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

import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import {
  DsfrDatePickerComponent,
  DsfrSpinnerComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { SpinnerAriaHiddenDirective } from "../shared/directives/spinner-aria-hidden.directive";

@NgModule({
  declarations: [ReportingFormComponent, StuctureStatsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    StructureStatsRoutingModule,
    SharedModule,
    FormsModule,
    DsfrDatePickerComponent,
    ReactiveFormsModule,
    DsfrModalComponent,
    DsfrSpinnerComponent,
    SpinnerAriaHiddenDirective,
  ],
  providers: [
    StructureStatsService,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class StructureStatsModule {}
