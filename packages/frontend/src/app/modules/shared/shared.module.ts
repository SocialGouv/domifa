import { AutoFocusDirective } from "./directives/autofocus.directive";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";
import { DigitOnlyDirective } from "./directives/digit-only.directive";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import { FormatPhoneNumberPipe } from "./pipes/formatPhoneNumber.pipe";
import { UsagerNomCompletPipe } from "./pipes/usager-nom-complet.pipe";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";

@NgModule({
  declarations: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
    AutoFocusDirective,
  ],
  exports: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
    CustomToastrComponent,
    AutoFocusDirective,
  ],
  imports: [CommonModule, FontAwesomeModule],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
