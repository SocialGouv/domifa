import { Component, inject } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";
import { LIENS_PARTENAIRES } from "../../plan-site/LIENS_PARTENAIRES.const";

@Component({
  selector: "app-partenaires",
  standalone: true,
  templateUrl: "./partenaires.component.html",
})
export class PartenairesComponent {
  private readonly seoService = inject(SeoService);
  public readonly partenaires = LIENS_PARTENAIRES;

  constructor() {
    this.seoService.updateTitleAndTags(
      "Nos partenaires - DomiFa",
      "Découvrez les partenaires de DomiFa : Beta.gouv.fr, France relance, Dihal, Ministère des Solidarités, UNCCAS."
    );
  }
}
