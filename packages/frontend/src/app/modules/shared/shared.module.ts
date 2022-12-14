import { ReplaceLineBreaks } from "./pipes/nl2br.pipe";

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";

import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import { UsagerNomCompletPipe } from "./pipes/usager-nom-complet.pipe";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { StrCapsAlphaDirective } from "./directives/str-caps-alpha.directive";

@NgModule({
  declarations: [
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
    ReplaceLineBreaks,
    StrCapsAlphaDirective,
  ],
  exports: [
    ReplaceLineBreaks,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
    CustomToastrComponent,
    StrCapsAlphaDirective,
  ],
  imports: [CommonModule, FontAwesomeModule],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
