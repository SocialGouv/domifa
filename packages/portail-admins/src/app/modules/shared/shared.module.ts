import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { ButtonComponent } from "./components/button/button.component";

import { AdminStructuresApiClient } from "./services";
import { AdminStructuresExportComponent } from "./components/admin-structures-export";
import {
  FormatPhoneNumberPipe,
  FormatBigNumberPipe,
  UcFirstPipe,
} from "./pipes";
import { FonctionSelectionComponent } from "./components/fonction-selection/fonction-selection.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FonctionFormatPipe } from "./pipes/fonction-format.pipe";
import {
  DsfrAlertModule,
  DsfrSkiplinksModule,
  DsfrFooterModule,
  DsfrHeaderModule,
  DsfrButtonModule,
  DsfrModalModule,
  DsfrButtonsGroupModule,
} from "@edugouvfr/ngx-dsfr";
import { StructureFormDeleteComponent } from "../admin-structures/components/structure-form-delete/structure-form-delete.component";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
} from "@edugouvfr/ngx-dsfr-ext";

@NgModule({
  declarations: [
    FormatPhoneNumberPipe,
    UcFirstPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
    ButtonComponent,
    AdminStructuresExportComponent,
    FonctionSelectionComponent,
  ],
  exports: [
    DsfrAlertModule,
    DsfrFooterModule,
    UcFirstPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    AdminStructuresExportComponent,
    CustomToastrComponent,
    ButtonComponent,
    FonctionSelectionComponent,
    FonctionFormatPipe,
    DsfrSkiplinksModule,
    DsfrHeaderModule,
    StructureFormDeleteComponent,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    DsfrButtonModule,
    DsfrModalModule,
    DsfrButtonsGroupModule,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FonctionFormatPipe,
    DsfrAlertModule,
    DsfrHeaderModule,
    StructureFormDeleteComponent,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    DsfrButtonModule,
    DsfrModalModule,
    DsfrButtonsGroupModule,
  ],
  providers: [AdminStructuresApiClient],
})
export class SharedModule {}
