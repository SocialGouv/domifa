import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerAccountRoutingModule } from "./usager-account-routing.module";
import { HomeUsagerComponent } from "./components/home-usager/home-usager.component";
import { UsagerAcceptCguComponent } from "./components/usager-accept-cgu/usager-accept-cgu.component";
import { HistoriqueCourriersComponent } from "./components/historique-courriers/historique-courriers.component";

@NgModule({
  imports: [
    CommonModule,
    UsagerAccountRoutingModule,
    HomeUsagerComponent,
    UsagerAcceptCguComponent,
    HistoriqueCourriersComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerAccountModule {}
