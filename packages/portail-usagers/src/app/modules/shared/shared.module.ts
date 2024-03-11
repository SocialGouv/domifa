import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { UsagerNomCompletPipe } from "./pipes/usager-nom-complet.pipe";

import { FormatInternationalPhoneNumberPipe } from "./pipes/formatInternationalPhoneNumber.pipe";

import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { SeoService } from "./services/seo.service";
import { ReplaceLineBreaks } from "./pipes";

@NgModule({
  declarations: [
    UsagerNomCompletPipe,
    FormatInternationalPhoneNumberPipe,
    CustomToastrComponent,
    ReplaceLineBreaks,
  ],
  exports: [
    UsagerNomCompletPipe,
    FormatInternationalPhoneNumberPipe,
    CustomToastrComponent,
    ReplaceLineBreaks,
  ],
  providers: [SeoService],
  imports: [CommonModule, FontAwesomeModule],
})
export class SharedModule {
  constructor(private readonly library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
