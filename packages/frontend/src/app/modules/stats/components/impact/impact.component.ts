import { SeoService } from "./../../../shared/services/seo.service";
import { fadeIn } from "./../../../../shared/animations";
import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  animations: [fadeIn],
  selector: "app-impact",
  templateUrl: "./impact.component.html",
  styleUrls: [
    "./impact.component.scss",
    "../public-stats/public-stats.component.scss",
  ],
})
export class ImpactComponent {
  public readonly countOptions = {
    duration: 2,
    separator: " ",
  };
  constructor(
    private readonly titleService: Title,
    private readonly seoService: SeoService
  ) {
    const title = "Mesure d’impact de DomiFa";
    const description =
      "Découvrez les témoignages de nos utilisateurs sur les bénéfices de DomiFa au quotidien";
    this.seoService.updateTitleAndTags(title, description);
    this.titleService.setTitle(title);
  }
}
