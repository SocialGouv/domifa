import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { ButtonComponent } from "./components/button/button.component";
import { StatCardComponent } from "./components/stat-card/stat-card.component";

import { AdminStructuresApiClient } from "./services";
import { AdminStructuresExportComponent } from "./components/admin-structures-export";
import {
  FormatPhoneNumberPipe,
  FormatBigNumberPipe,
  UcFirstPipe,
} from "./pipes";
import { FonctionSelectionComponent } from "./components/fonction-selection/fonction-selection.component";
import { FonctionFormatPipe } from "./pipes/fonction-format.pipe";
import { DsfrAlertModule } from "@edugouvfr/ngx-dsfr";

@NgModule({
  declarations: [],
  exports: [
    UcFirstPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    AdminStructuresExportComponent,
    CustomToastrComponent,
    ButtonComponent,
    FonctionSelectionComponent,
    StatCardComponent,
    FonctionFormatPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FonctionFormatPipe,
    FormatPhoneNumberPipe,
    UcFirstPipe,
    FormatBigNumberPipe,
    DsfrAlertModule,
    CustomToastrComponent,
    ButtonComponent,
    AdminStructuresExportComponent,
    FonctionSelectionComponent,
    StatCardComponent,
  ],
  providers: [AdminStructuresApiClient],
})
export class SharedModule {}
