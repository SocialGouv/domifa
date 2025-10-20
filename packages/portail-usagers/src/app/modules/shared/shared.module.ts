import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { SeoService } from "./services/seo.service";
import { ReplaceLineBreaks } from "./pipes/nl2br.pipe";
import {
  DsfrAccordionModule,
  DsfrButtonModule,
  DsfrDataTableModule,
  DsfrButtonsGroupModule,
  DsfrFooterModule,
  DsfrFormInputModule,
  DsfrFormPasswordModule,
  DsfrHeaderModule,
  DsfrLinkModule,
  DsfrModalModule,
  DsfrPaginationModule,
  DsfrSkiplinksModule,
} from "@edugouvfr/ngx-dsfr";
import { FaqComponent } from "./components/faq/faq.component";
import { DsfrToastComponent, DsfrToastService } from "@edugouvfr/ngx-dsfr-ext";

@NgModule({
  declarations: [ReplaceLineBreaks],
  exports: [
    ReplaceLineBreaks,
    DsfrFooterModule,
    DsfrSkiplinksModule,
    DsfrFormInputModule,
    DsfrFormPasswordModule,
    DsfrLinkModule,
    DsfrAccordionModule,
    DsfrButtonModule,
    FaqComponent,
    DsfrHeaderModule,
    DsfrPaginationModule,
    DsfrDataTableModule,
    DsfrModalModule,
    DsfrButtonsGroupModule,
    DsfrToastComponent,
  ],
  providers: [SeoService, DsfrToastService],
  imports: [
    CommonModule,
    FontAwesomeModule,
    DsfrFooterModule,
    DsfrSkiplinksModule,
    DsfrFormInputModule,
    DsfrFormPasswordModule,
    DsfrButtonModule,
    DsfrLinkModule,
    FaqComponent,
    DsfrHeaderModule,
    DsfrPaginationModule,
    DsfrDataTableModule,
    DsfrModalModule,
    DsfrButtonsGroupModule,
    DsfrToastComponent,
  ],
})
export class SharedModule {
  constructor(private readonly library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
