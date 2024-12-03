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

@NgModule({
  declarations: [
    FormatPhoneNumberPipe,
    UcFirstPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
    AdminStructuresExportComponent,
  ],
  exports: [
    UcFirstPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
    AdminStructuresExportComponent,
    CustomToastrComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
  providers: [AdminStructuresApiClient],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
