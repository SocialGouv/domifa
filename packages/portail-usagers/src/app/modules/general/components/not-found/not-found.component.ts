import { Component, OnInit } from "@angular/core";
import { SeoService } from "../../../shared/services/seo.service";

@Component({
  selector: "app-not-found",
  styleUrls: ["./not-found.component.css"],
  templateUrl: "./not-found.component.html",
})
export class NotFoundComponent implements OnInit {
  constructor(private readonly seoService: SeoService) {}
  public ngOnInit() {
    this.seoService.updateTitleAndTags(
      "Page non trouvée - Mon DomiFa",
      "La page que vous recherchez n'existe pas ou a été déplacée",
    );
  }
}
