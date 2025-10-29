import { Component } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-cgu",
  templateUrl: "./cgu.component.html",
})
export class CguComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "Conditions générales d’utilisation de Mon DomiFa",
      "Conditions générales d’utilisation de Mon DomiFa",
    );
  }
}
