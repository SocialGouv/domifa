import { Component } from "@angular/core";
import { SeoService } from "../../../../../../shared/services/seo.service";

@Component({
  selector: "app-faq-security",
  standalone: true,
  imports: [],
  templateUrl: "./faq-security.component.html",
  styleUrl: "./faq-security.component.css",
})
export class FaqSecurityComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "FAQ - Sécurité et confidentialité - Mon DomiFa",
      "Questions fréquentes sur la sécurité de vos données et la protection de votre vie privée",
    );
  }
}
