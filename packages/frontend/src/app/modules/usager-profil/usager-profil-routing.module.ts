import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProfilOverviewComponent } from "./components/profil-overview/profil-overview.component";

const routes: Routes = [{ path: ":id", component: ProfilOverviewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerProfilRoutingModule {}
