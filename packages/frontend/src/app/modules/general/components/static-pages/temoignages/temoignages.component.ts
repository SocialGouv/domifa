import { Component, inject } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-temoignages",
  standalone: true,
  templateUrl: "./temoignages.component.html",
})
export class TemoignagesComponent {
  private readonly seoService = inject(SeoService);

  constructor() {
    this.seoService.updateTitleAndTags(
      "Témoignages - DomiFa",
      "Découvrez les témoignages des structures et des domiciliés qui utilisent DomiFa au quotidien."
    );
  }
}
