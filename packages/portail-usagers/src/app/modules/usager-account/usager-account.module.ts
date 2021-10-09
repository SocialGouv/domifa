import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAccountRoutingModule } from "./usager-account-routing.module";
import { HomeUsagerComponent } from "./home-usager/home-usager.component";
import { SectionInfosComponent } from "./section-infos/section-infos.component";
import { SectionCourriersComponent } from "./section-courriers/section-courriers.component";

@NgModule({
  declarations: [
    HomeUsagerComponent,
    SectionInfosComponent,
    SectionCourriersComponent,
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
