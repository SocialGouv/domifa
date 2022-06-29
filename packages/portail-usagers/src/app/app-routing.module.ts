import { RgaaComponent } from "./modules/general/components/_static/rgaa/rgaa.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";

import { AuthGuard } from "./guards/auth-guard";
import { CguComponent } from "./modules/general/components/_static/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/_static/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/_static/politique/politique.component";

const routes: Routes = [
  { path: "", redirectTo: "/auth/login", pathMatch: "full" },
  {
    path: "auth",
    loadChildren: () =>
      import("./modules/usager-auth/usager-auth.module").then(
        (m) => m.UsagerAuthModule,
      ),
  },
  {
    path: "account",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/usager-account/usager-account.module").then(
        (m) => m.UsagerAccountModule,
      ),
  },
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
