import { ReplaceLineBreaks } from "./pipes/nl2br.pipe";

import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { StrCapsAlphaDirective } from "./directives/str-caps-alpha.directive";
import { UsagerNomCompletPipe, FormatBigNumberPipe } from "./pipes";
import { DisplayTableImageComponent } from "./components/display-table-image/display-table-image.component";

@NgModule({
  declarations: [
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatBigNumberPipe,
    CustomToastrComponent,
    ReplaceLineBreaks,
    StrCapsAlphaDirective,
    DisplayTableImageComponent,
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
    DisplayTableImageComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
