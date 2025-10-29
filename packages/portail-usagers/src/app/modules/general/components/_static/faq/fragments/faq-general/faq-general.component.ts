import { Component } from "@angular/core";
import { SeoService } from "../../../../../../shared/services/seo.service";

@Component({
  selector: "app-faq-general",
  standalone: true,

  templateUrl: "./faq-general.component.html",
  styleUrl: "./faq-general.component.css",
})
export class FaqGeneralComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "Mon DomiFa - Les questions fréquentes",
      "La FAQ rassemble toutes les questions que vous pouvez vous poser sur Mon DomiFa",
    );
  }
}
