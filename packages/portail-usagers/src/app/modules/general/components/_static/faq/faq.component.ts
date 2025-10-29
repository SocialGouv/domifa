import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { DsfrSidemenuModule } from "@edugouvfr/ngx-dsfr";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [RouterModule, CommonModule, DsfrSidemenuModule],
  templateUrl: "./faq.component.html",
})
export class FaqComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "Mon DomiFa - Les questions fréquentes",
      "La FAQ rassemble toutes les questions que vous pouvez vous poser sur Mon DomiFa",
    );
  }
}
