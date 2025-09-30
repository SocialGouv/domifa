import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { SeoService } from "./services/seo.service";
import { ReplaceLineBreaks } from "./pipes/nl2br.pipe";
import {
  DsfrFooterModule,
  DsfrHeaderModule,
  DsfrSkiplinksModule,
} from "@edugouvfr/ngx-dsfr";

@NgModule({
  declarations: [CustomToastrComponent, ReplaceLineBreaks],
  exports: [
    CustomToastrComponent,
    ReplaceLineBreaks,
    DsfrFooterModule,
    DsfrSkiplinksModule,
    DsfrHeaderModule,
  ],
  providers: [SeoService],
  imports: [
    CommonModule,
    FontAwesomeModule,
    DsfrFooterModule,
    DsfrSkiplinksModule,
    DsfrHeaderModule,
  ],
})
export class SharedModule {
  constructor(private readonly library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
