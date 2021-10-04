import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { UsagerNomCompletPipe } from "./pipes/usager-nom-complet.pipe";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";
import { DigitOnlyDirective } from "./directives/digit-only.directive";
import { FormatPhoneNumberPipe } from "./pipes/formatPhoneNumber.pipe";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";

import { FA_ICONS } from "./constants/FA_ICONS.const";

@NgModule({
  declarations: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
  ],
  exports: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
  ],
  imports: [CommonModule, FontAwesomeModule],
  providers: [],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
