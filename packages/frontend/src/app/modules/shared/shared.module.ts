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
import { LoadingService } from "./services/loading.service";

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
  providers: [LoadingService],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
