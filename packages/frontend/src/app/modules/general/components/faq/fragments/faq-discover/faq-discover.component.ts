import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SeoService } from "../../../../../shared/services";
import { AdminAuthRoutingModule } from "src/app/modules/auth/auth.routing.module";

@Component({
  selector: "app-faq-discover",
  imports: [CommonModule, AdminAuthRoutingModule],
  templateUrl: "./faq-discover.component.html",
  standalone: true,
})
export class FaqDiscoverComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "DomiFa - Les questions fréquentes",
      "La FAQ rassemble toutes les questions que vous pouvez vous poser sur DomiFa"
    );
  }
}
