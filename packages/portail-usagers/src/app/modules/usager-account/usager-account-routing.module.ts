import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeUsagerComponent } from "./home-usager/home-usager.component";

const routes: Routes = [{ path: "", component: HomeUsagerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerAccountRoutingModule {}
