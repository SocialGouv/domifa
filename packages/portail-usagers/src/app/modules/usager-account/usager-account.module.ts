import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAccountRoutingModule } from "./usager-account-routing.module";
import { HomeUsagerComponent } from "./components/home-usager/home-usager.component";
import { SectionCourriersComponent } from "./components/home-usager/sections/section-courriers/section-courriers.component";
import { SectionOptionsComponent } from "./components/home-usager/sections/section-options/section-options.component";
import { SharedModule } from "../shared/shared.module";
import { UsagerAcceptCguComponent } from "./components/usager-accept-cgu/usager-accept-cgu.component";
import { GeneralModule } from "../general/general.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HistoriqueCourriersComponent } from "./components/historique-courriers/historique-courriers.component";
import { StructureInformationComponent } from "./components/home-usager/sections/structure-information/structure-information.component";
import { SectionLinksComponent } from "./components/home-usager/sections/section-links/section-links.component";
import { SectionInfosComponent } from "./components/home-usager/sections/section-infos/section-infos.component";
import { FormatInternationalPhoneNumberPipe } from "./pipes";
import { SectionDocsComponent } from "./components/home-usager/sections/section-docs/section-docs.component";

@NgModule({
  declarations: [
    HomeUsagerComponent,
    SectionCourriersComponent,
    SectionOptionsComponent,
    UsagerAcceptCguComponent,
    HistoriqueCourriersComponent,
    StructureInformationComponent,
    SectionInfosComponent,
    SectionDocsComponent,
  ],
  imports: [
    CommonModule,
    UsagerAccountRoutingModule,
    SharedModule,
    GeneralModule,
    FormsModule,
    ReactiveFormsModule,
    SectionLinksComponent,
    FormatInternationalPhoneNumberPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerAccountModule {}
