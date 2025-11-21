import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";
import { CguComponent } from "./modules/general/components/static-pages/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/static-pages/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/static-pages/politique/politique.component";
import { PlanSiteComponent } from "./modules/general/components/static-pages/plan-site/plan-site.component";
import { RoleRedirectGuard } from "./guards/redirect-guard";
import { structuresListResolver } from "./modules/admin-structures/resolvers/structures-list.resolver";

const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>
      import("./modules/admin-auth/admin-auth.module").then(
        (m) => m.AdminAuthModule
      ),
  },
  {
    path: "structure",
    canActivate: [AuthGuard],
    data: { roles: ["super-admin-domifa"] },
    resolve: {
      structureList: structuresListResolver,
    },
    loadChildren: () =>
      import("./modules/admin-structures/admin-structures.module").then(
        (m) => m.AdminStructuresModule
      ),
  },
  {
    path: "structure/:structureId",
    canActivate: [AuthGuard],
    data: {
      roles: ["super-admin-domifa"],
    },
    loadChildren: () =>
      import("./modules/structure/structure.module").then(
        (m) => m.StructureModule
      ),
  },
  {
    path: "stats",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
  },
  {
    path: "manage-users",
    canActivate: [AuthGuard],
    data: {
      roles: ["super-admin-domifa"],
    },
    loadChildren: () =>
      import("./modules/manage-users/manage-users.module").then(
        (m) => m.ManageUsersModule
      ),
  },
  // {
  // path: "structures-confirm",
  // canActivate: [AuthGuard],
  // loadChildren: () =>
  // import(
  // "./modules/admin-structures-confirm/admin-structures-confirm.module"
  // ).then((m) => m.AdminStructureConfirmModule),
  // },
  {
    path: "",
    canActivate: [RoleRedirectGuard],
    pathMatch: "full",
    children: [],
  },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  { path: "plan-site", component: PlanSiteComponent },
  { path: "confidentialite", component: PolitiqueComponent },
  { path: "cgu", component: CguComponent },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
