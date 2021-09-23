import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CguComponent } from "./modules/general/components/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions-legales/mentions-legales.component";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";
import { PolitiqueComponent } from "./modules/general/components/politique/politique.component";

const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>
      import("./modules/usager-auth/usager-auth.module").then(
        (m) => m.UsagerAuthModule
      ),
  },
  {
    path: "account",
    loadChildren: () =>
      import("./modules/usager-account/usager-account.module").then(
        (m) => m.UsagerAccountModule
      ),
  },
  { path: "", redirectTo: "/auth/login", pathMatch: "full" },
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
