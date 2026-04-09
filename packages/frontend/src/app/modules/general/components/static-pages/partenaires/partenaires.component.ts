import { Component, inject } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-partenaires",
  standalone: true,
  templateUrl: "./partenaires.component.html",
})
export class PartenairesComponent {
  private readonly seoService = inject(SeoService);

  constructor() {
    this.seoService.updateTitleAndTags(
      "Nos partenaires - DomiFa",
      "Découvrez les partenaires de DomiFa : DINUM, DGCS, ANCT, UNCCAS, Beta.gouv."
    );
  }
}
