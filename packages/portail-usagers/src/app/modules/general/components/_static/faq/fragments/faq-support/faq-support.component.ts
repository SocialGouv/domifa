import { Component } from "@angular/core";
import { SeoService } from "../../../../../../shared/services/seo.service";

@Component({
  selector: "app-faq-support",
  standalone: true,
  imports: [],
  templateUrl: "./faq-support.component.html",
  styleUrl: "./faq-support.component.css",
})
export class FaqSupportComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "FAQ - Assistance technique - Mon DomiFa",
      "Questions fréquentes sur l'assistance technique et le support utilisateur de Mon DomiFa",
    );
  }
}
