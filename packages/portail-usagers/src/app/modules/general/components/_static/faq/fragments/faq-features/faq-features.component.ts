import { Component } from "@angular/core";
import { SeoService } from "../../../../../../shared/services/seo.service";

@Component({
  selector: "app-faq-features",
  standalone: true,
  imports: [],
  templateUrl: "./faq-features.component.html",
  styleUrl: "./faq-features.component.css",
})
export class FaqFeaturesComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "FAQ - Fonctionnalités - Mon DomiFa",
      "Questions fréquentes sur les fonctionnalités et l'utilisation du portail Mon DomiFa",
    );
  }
}
