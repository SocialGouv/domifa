import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeUsagerComponent } from "./components/home-usager/home-usager.component";
import { UsagerAcceptCguComponent } from "./components/usager-accept-cgu/usager-accept-cgu.component";

const routes: Routes = [
  { path: "", component: HomeUsagerComponent },
  {
    path: "accept-terms",
    component: UsagerAcceptCguComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerAccountRoutingModule {}
