import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";

const routes: Routes = [
  { path: "", redirectTo: "/structures", pathMatch: "full" },
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
    path: "structures-confirm",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import(
        "./modules/admin-structures-confirm/admin-structures-confirm.module"
      ).then((m) => m.AdminStructuresConfirmModule),
  },

  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
