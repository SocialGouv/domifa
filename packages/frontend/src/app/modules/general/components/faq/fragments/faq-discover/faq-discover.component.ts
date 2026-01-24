import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SeoService } from "../../../../../shared/services";

@Component({
  selector: "app-faq-discover",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./faq-discover.component.html",
})
export class FaqDiscoverComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "DomiFa - Les questions fréquentes",
      "La FAQ rassemble toutes les questions que vous pouvez vous poser sur DomiFa"
    );
  }
}
