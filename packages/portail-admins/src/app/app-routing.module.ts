import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";
import { CguComponent } from "./modules/general/components/_static/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/_static/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/_static/politique/politique.component";
import { RgaaComponent } from "./modules/general/components/_static/rgaa/rgaa.component";

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
    path: "sms",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/admin-sms/admin-sms.module").then(
        (m) => m.AdminSmsModule
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
  { path: "", redirectTo: "/structures", pathMatch: "full" },
  { path: "accessibilite", component: RgaaComponent },
  { path: "mentions-legales", component: MentionsLegalesComponent },
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
