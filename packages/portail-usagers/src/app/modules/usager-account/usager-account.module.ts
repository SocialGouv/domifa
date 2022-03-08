import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAccountRoutingModule } from "./usager-account-routing.module";
import { HomeUsagerComponent } from "./components/home-usager/home-usager.component";
import { SectionCourriersComponent } from "./components/section-courriers/section-courriers.component";
import { SectionInfosComponent } from "./components/section-infos/section-infos.component";
import { SectionOptionsComponent } from './components/section-options/section-options.component';

@NgModule({
  declarations: [
    HomeUsagerComponent,
    SectionInfosComponent,
    SectionCourriersComponent,
    SectionOptionsComponent,
  ],
  imports: [
    CommonModule,
    UsagerAccountRoutingModule,
    SharedModule,
    FontAwesomeModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerAccountModule {}
