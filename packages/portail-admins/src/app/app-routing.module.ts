import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";
import { CguComponent } from "./modules/general/components/static-pages/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/static-pages/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/static-pages/politique/politique.component";
import { PlanSiteComponent } from "./modules/general/components/static-pages/plan-site/plan-site.component";
import { RoleRedirectGuard } from "./guards/redirect-guard";

const routes: Routes = [
  {
    path: "auth",
    title: "Connexion - Admin DomiFa",
    loadChildren: () =>
      import("./modules/admin-auth/admin-auth.module").then(
        (m) => m.AdminAuthModule
      ),
  },
  {
    path: "structure",
    title: "Structures - Admin DomiFa",
    canActivate: [AuthGuard],
    data: { roles: ["super-admin-domifa"] },
    loadChildren: () =>
      import("./modules/admin-structures/admin-structures.module").then(
        (m) => m.AdminStructuresModule
      ),
  },
  {
    path: "structure/:structureUuid",
    title: "Fiche structure - Admin DomiFa",
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
    title: "Statistiques nationales - Admin DomiFa",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
  },
  {
    path: "manage-users",
    title: "Utilisateurs Pilotage - Admin DomiFa",
    canActivate: [AuthGuard],
    data: {
      roles: ["super-admin-domifa"],
    },
    loadChildren: () =>
      import("./modules/manage-users/manage-users.module").then(
        (m) => m.ManageUsersModule
      ),
  },
  {
    path: "manage-structure-users",
    title: "Utilisateurs des structures - Admin DomiFa",
    canActivate: [AuthGuard],
    data: {
      roles: ["super-admin-domifa"],
    },
    loadChildren: () =>
      import(
        "./modules/manage-structure-users/manage-structure-users.module"
      ).then((m) => m.ManageStructureUsersModule),
  },
  {
    path: "suspicious-activity",
    title: "Activités suspectes - Admin DomiFa",
    canActivate: [AuthGuard],
    data: { roles: ["super-admin-domifa"] },
    loadChildren: () =>
      import("./modules/suspicious-activity/suspicious-activity.module").then(
        (m) => m.SuspiciousActivityModule
      ),
  },
  {
    path: "sessions",
    title: "Sessions - Admin DomiFa",
    canActivate: [AuthGuard],
    data: { roles: ["super-admin-domifa"] },
    loadChildren: () =>
      import("./modules/sessions-stats/sessions-stats.module").then(
        (m) => m.SessionsStatsModule
      ),
  },
  {
    path: "brevo-blocklist",
    title: "Emails bloqués Brevo - Admin DomiFa",
    canActivate: [AuthGuard],
    data: { roles: ["super-admin-domifa"] },
    loadChildren: () =>
      import("./modules/brevo-blocklist/brevo-blocklist.module").then(
        (m) => m.BrevoBlocklistModule
      ),
  },
  {
    path: "",
    canActivate: [RoleRedirectGuard],
    pathMatch: "full",
    children: [],
  },
  {
    path: "mentions-legales",
    title: "Mentions légales - Admin DomiFa",
    component: MentionsLegalesComponent,
  },
  {
    path: "plan-site",
    title: "Plan du site - Admin DomiFa",
    component: PlanSiteComponent,
  },
  {
    path: "confidentialite",
    title: "Politique de confidentialité - Admin DomiFa",
    component: PolitiqueComponent,
  },
  { path: "cgu", title: "CGU - Admin DomiFa", component: CguComponent },
  {
    path: "404",
    title: "Page introuvable - Admin DomiFa",
    component: NotFoundComponent,
  },
  { path: "**", redirectTo: "404" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
