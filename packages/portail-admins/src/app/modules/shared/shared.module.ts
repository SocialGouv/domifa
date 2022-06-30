import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { AdminStructuresExportComponent } from "../general/components/admin-structures-export";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { FA_ICONS } from "./constants/FA_ICONS.const";

import { AdminNomCompletPipe } from "./pipes/admin-nom-complet.pipe";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import { FormatPhoneNumberPipe } from "./pipes/formatPhoneNumber.pipe";
import {
  AdminStructuresApiClient,
  AdminStructuresExportApiClient,
} from "./services";
import { AdminStructuresDeleteApiClient } from "./services/api/admin-structures-delete-api-client.service";

@NgModule({
  declarations: [
    AdminNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    AdminStructuresExportComponent,
    CustomToastrComponent,
  ],
  exports: [
    AdminNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    AdminStructuresExportComponent,
    FontAwesomeModule,
    CustomToastrComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
  providers: [
    AdminStructuresExportApiClient,
    AdminStructuresApiClient,
    AdminStructuresDeleteApiClient,
  ],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
