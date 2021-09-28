import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAccountRoutingModule } from "./usager-account-routing.module";
import { HomeUsagerComponent } from "./home-usager/home-usager.component";
import { SectionInfosComponent } from "./section-infos/section-infos.component";

@NgModule({
  declarations: [HomeUsagerComponent, SectionInfosComponent],
  imports: [CommonModule, UsagerAccountRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerAccountModule {}
