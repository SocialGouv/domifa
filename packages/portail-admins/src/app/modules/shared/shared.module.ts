import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { FA_ICONS } from "./constants/FA_ICONS.const";

import { AdminNomCompletPipe } from "./pipes/admin-nom-complet.pipe";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import { FormatPhoneNumberPipe } from "./pipes/formatPhoneNumber.pipe";
import {
  AdminStructuresApiClient,
  AdminStructuresExportApiClient,
} from "./services";
import { AdminStructuresExportComponent } from "./components/admin-structures-export";

@NgModule({
  declarations: [
    AdminNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
    AdminStructuresExportComponent,
  ],
  exports: [
    AdminNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
    AdminStructuresExportComponent,
    CustomToastrComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
  providers: [AdminStructuresExportApiClient, AdminStructuresApiClient],
})
export class SharedModule {
  constructor(private readonly library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
