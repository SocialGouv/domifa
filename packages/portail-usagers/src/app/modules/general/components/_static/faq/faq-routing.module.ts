import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FaqComponent } from "./faq.component";
import { FaqGeneralComponent } from "./fragments/faq-general/faq-general.component";
import { FaqAccessComponent } from "./fragments/faq-access/faq-access.component";
import { FaqFeaturesComponent } from "./fragments/faq-features/faq-features.component";
import { FaqSecurityComponent } from "./fragments/faq-security/faq-security.component";
import { FaqSupportComponent } from "./fragments/faq-support/faq-support.component";

const routes: Routes = [
  {
    path: "",
    component: FaqComponent,
    children: [
      { path: "", redirectTo: "generalites", pathMatch: "full" },
      { path: "generalites", component: FaqGeneralComponent },
      { path: "acces-connexion", component: FaqAccessComponent },
      { path: "fonctionnalites", component: FaqFeaturesComponent },
      { path: "securite-confidentialite", component: FaqSecurityComponent },
      { path: "assistance-technique", component: FaqSupportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqRoutingModule {}
