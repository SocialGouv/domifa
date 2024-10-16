import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";

import { ReplaceLineBreaks } from "./pipes";
import { DateFrDirective, CleanStrDirective } from "./directives";

@NgModule({
  declarations: [
    DateFrDirective,
    CleanStrDirective,
    CustomToastrComponent,
    ReplaceLineBreaks,
  ],
  exports: [
    ReplaceLineBreaks,
    DateFrDirective,
    CleanStrDirective,
    CustomToastrComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
