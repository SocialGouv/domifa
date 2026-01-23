import { DsfrFooterModule } from "@edugouvfr/ngx-dsfr";
import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";

import { FullNamePipe, ReplaceLineBreaks } from "./pipes";
import { DateFrDirective, CleanStrDirective } from "./directives";
import { ButtonComponent } from "./components/button/button.component";
import { InputReferrerComponent } from "./components/input-referrer/input-referrer.component";
import { FormsModule } from "@angular/forms";
import { FonctionSelectionComponent } from "./components/fonction-selection/fonction-selection.component";
import { FonctionFormatPipe } from "./pipes/fonction-format.pipe";
import { UserStructurePasswordFormComponent } from "./components/user-structure-password-form/user-structure-password-form.component";

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    FullNamePipe,
    FonctionFormatPipe,
    DsfrFooterModule,
  ],
  declarations: [
    DateFrDirective,
    CleanStrDirective,
    CustomToastrComponent,
    ReplaceLineBreaks,
    ButtonComponent,
    InputReferrerComponent,
    FonctionSelectionComponent,
    UserStructurePasswordFormComponent,
  ],
  exports: [
    ReplaceLineBreaks,
    InputReferrerComponent,
    FonctionSelectionComponent,
    DateFrDirective,
    CleanStrDirective,
    CustomToastrComponent,
    FontAwesomeModule,
    ButtonComponent,
    FonctionFormatPipe,
    DsfrFooterModule,
    UserStructurePasswordFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
