import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";

import {
  UsagerNomCompletPipe,
  FormatBigNumberPipe,
  ReplaceLineBreaks,
  SortArrayPipe,
} from "./pipes";
import { DisplayTableImageComponent } from "./components/display-table-image/display-table-image.component";
import {
  DateFrDirective,
  CleanStrDirective,
  StrCapsAlphaDirective,
} from "./directives";

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

    SortArrayPipe,
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

    SortArrayPipe,
  ],
  imports: [CommonModule, FontAwesomeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
