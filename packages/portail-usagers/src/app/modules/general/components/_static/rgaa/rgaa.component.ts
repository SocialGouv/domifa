import { Component, OnInit } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-rgaa",
  templateUrl: "./rgaa.component.html",
})
export class RgaaComponent implements OnInit {
  constructor(private readonly seoService: SeoService) {}
  ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Déclaration d'accessibilité de Mon DomiFa",
      "Conformité RGAA et engagement pour l'accessibilité numérique du portail Mon DomiFa",
    );
  }
}
