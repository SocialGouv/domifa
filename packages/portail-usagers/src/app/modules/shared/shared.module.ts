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
  DsfrButtonModule,
  DsfrFooterModule,
  DsfrHeaderModule,
  DsfrPaginationModule,
  DsfrSkiplinksModule,
} from "@edugouvfr/ngx-dsfr";
import { FaqComponent } from "./components/faq/faq.component";

@NgModule({
  declarations: [CustomToastrComponent, ReplaceLineBreaks],
  exports: [
    CustomToastrComponent,
    ReplaceLineBreaks,
    DsfrFooterModule,
    DsfrSkiplinksModule,
    DsfrHeaderModule,
    DsfrButtonModule,
    DsfrPaginationModule,
  ],
  providers: [SeoService],
  imports: [
    CommonModule,
    FontAwesomeModule,
    DsfrFooterModule,
    DsfrSkiplinksModule,
    DsfrHeaderModule,
    DsfrButtonModule,
    DsfrPaginationModule,
  ],
})
export class SharedModule {
  constructor(private readonly library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
