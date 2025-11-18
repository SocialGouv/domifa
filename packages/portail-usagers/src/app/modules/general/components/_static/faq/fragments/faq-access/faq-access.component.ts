import { Component } from "@angular/core";
import { SeoService } from "../../../../../../shared/services/seo.service";

@Component({
  selector: "app-faq-access",
  standalone: true,
  imports: [],
  templateUrl: "./faq-access.component.html",
  styleUrl: "./faq-access.component.css",
})
export class FaqAccessComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "FAQ - Accès et connexion - Mon DomiFa",
      "Questions fréquentes sur l'accès à Mon DomiFa, la création de compte et la connexion",
    );
  }
}
