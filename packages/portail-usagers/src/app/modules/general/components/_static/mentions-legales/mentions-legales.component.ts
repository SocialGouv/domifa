import { Component, OnInit } from "@angular/core";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-mentions-legales",
  templateUrl: "./mentions-legales.component.html",
})
export class MentionsLegalesComponent implements OnInit {
  public constructor(private readonly seoService: SeoService) {}
  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Mentions légales de Mon DomiFa",
      "Informations légales, éditeur, hébergeur et crédits du portail Mon DomiFa",
    );
  }
}
