import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAccountRoutingModule } from "./usager-account-routing.module";
import { HomeUsagerComponent } from "./components/home-usager/home-usager.component";
import { SectionCourriersComponent } from "./components/home-usager/sections/section-courriers/section-courriers.component";
import { SectionInfosComponent } from "./components/home-usager/sections/section-infos/section-infos.component";
import { SectionOptionsComponent } from "./components/home-usager/sections/section-options/section-options.component";
import { SharedModule } from "../shared/shared.module";
import { UsagerAcceptCguComponent } from "./components/usager-accept-cgu/usager-accept-cgu.component";
import { GeneralModule } from "../general/general.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HistoriqueCourriersComponent } from "./components/historique-courriers/historique-courriers.component";
import { ReplaceLineBreaks } from "./pipes/nl2br.pipe";
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { StructureInformationComponent } from "./components/structure-information/structure-information.component";

@NgModule({
  declarations: [
    HomeUsagerComponent,
    SectionInfosComponent,
    SectionCourriersComponent,
    SectionOptionsComponent,
    UsagerAcceptCguComponent,
    HistoriqueCourriersComponent,
    StructureInformationComponent,
  ],
  imports: [
    CommonModule,
    UsagerAccountRoutingModule,
    SharedModule,
    GeneralModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ReplaceLineBreaks,
    NgbPagination,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerAccountModule {}
