import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";
import { CguComponent } from "./modules/general/components/static-pages/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/static-pages/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/static-pages/politique/politique.component";
import { PlanSiteComponent } from "./modules/general/components/static-pages/plan-site/plan-site.component";

const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>
      import("./modules/admin-auth/admin-auth.module").then(
        (m) => m.AdminAuthModule
      ),
  },
  {
    path: "structures",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/admin-structures/admin-structures.module").then(
        (m) => m.AdminStructuresModule
      ),
  },
  {
    path: "users",
    loadChildren: () =>
      import("./modules/users/users.module").then((m) => m.UsersModule),
  },
  {
    path: "structure",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/structure/structure.module").then(
        (m) => m.StructureModule
      ),
  },
  {
    path: "structures-confirm",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import(
        "./modules/admin-structures-confirm/admin-structures-confirm.module"
      ).then((m) => m.AdminStructuresConfirmModule),
  },
  { path: "", redirectTo: "/structures/rapports", pathMatch: "full" },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  { path: "plan-site", component: PlanSiteComponent },
  { path: "confidentialite", component: PolitiqueComponent },
  { path: "cgu", component: CguComponent },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
