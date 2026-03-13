import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FaqComponent } from "./faq.component";
import { FaqSecurityComponent } from "./fragments/faq-security/faq-security.component";
import { FaqDiscoverComponent } from "./fragments/faq-discover/faq-discover.component";
import { FaqUsageComponent } from "./fragments/faq-usage/faq-usage.component";
import { FaqFichesComponent } from "./fragments/faq-fiches/faq-fiches.component";
import { FaqVideoTutorialComponent } from "./fragments/faq-video-tutorial/faq-video-tutorial.component";

const routes: Routes = [
  {
    path: "",
    component: FaqComponent,
    children: [
      { path: "", redirectTo: "decouvrir-domifa", pathMatch: "full" },
      { path: "decouvrir-domifa", component: FaqDiscoverComponent },
      { path: "utiliser-domifa", component: FaqUsageComponent },
      { path: "securite-et-confidentialite", component: FaqSecurityComponent },
      { path: "fiches-pratiques", component: FaqFichesComponent },
      { path: "tutoriels-videos", component: FaqVideoTutorialComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqRoutingModule {}
