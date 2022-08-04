import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { UsagerNomCompletPipe } from "./pipes/usager-nom-complet.pipe";

import { FormatInternationalPhoneNumberPipe } from "./pipes/formatInternationalPhoneNumber.pipe";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";

@NgModule({
  declarations: [
    UsagerNomCompletPipe,
    FormatInternationalPhoneNumberPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
  ],
  exports: [
    UsagerNomCompletPipe,
    FormatInternationalPhoneNumberPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
