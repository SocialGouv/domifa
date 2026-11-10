import { Component, Input } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-cgu",
  templateUrl: "./cgu.component.html",
})
export class CguComponent {
  // Rendered inside another page (accept-terms): the host page owns the h1
  @Input() public embedded = false;

  constructor(private readonly seoService: SeoService) {
    this.seoService.updateTitleAndTags(
      "Conditions générales d’utilisation de Mon DomiFa",
      "Les conditions générales d’utilisation (dites « CGU ») fixent le cadre juridique de la Plateforme Mon DomiFa"
    );
  }
}
