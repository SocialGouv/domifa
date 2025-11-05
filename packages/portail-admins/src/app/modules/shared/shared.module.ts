import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { FA_ICONS } from "./constants/FA_ICONS.const";

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
    AdminStructuresExportComponent,
    FonctionSelectionComponent,
  ],
  exports: [
    DsfrAlertModule,
    DsfrFooterModule,
    UcFirstPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
    AdminStructuresExportComponent,
    CustomToastrComponent,
    FonctionSelectionComponent,
    FonctionFormatPipe,
    DsfrSkiplinksModule,
    DsfrHeaderModule,
    StructureFormDeleteComponent,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
  ],
  imports: [
    DsfrAlertModule,
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FonctionFormatPipe,
    DsfrAlertModule,
    DsfrHeaderModule,
    StructureFormDeleteComponent,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
  ],
  providers: [AdminStructuresApiClient],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
