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
import { ButtonComponent } from "./components/button/button.component";

@NgModule({
  declarations: [
    DateFrDirective,
    CleanStrDirective,
    CustomToastrComponent,
    ReplaceLineBreaks,
    ButtonComponent,
  ],
  exports: [
    ReplaceLineBreaks,
    DateFrDirective,
    CleanStrDirective,
    CustomToastrComponent,
    FontAwesomeModule,
    ButtonComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
