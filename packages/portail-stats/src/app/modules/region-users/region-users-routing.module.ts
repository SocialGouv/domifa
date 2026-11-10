import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RegionUsersListComponent } from "./components/region-users-list/region-users-list.component";

const routes: Routes = [{ path: "", component: RegionUsersListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegionUsersRoutingModule {}
