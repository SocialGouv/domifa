import { Component, OnInit } from "@angular/core";
import DOMIFA_NEWS from "../../../../../../assets/files/news.json";
import { SeoService } from "../../../../shared/services/seo.service";
import { NewsItem } from "@domifa/common";

@Component({
  selector: "app-news",
  styleUrls: ["./news.component.css"],
  templateUrl: "./news.component.html",
})
export class NewsComponent implements OnInit {
  public readonly DOMIFA_NEWS: NewsItem[] = DOMIFA_NEWS;

  public constructor(private readonly seoService: SeoService) {}

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Les dernières nouveautés de Mon DomiFa",
      "Mon DomiFa permet aux domiciliés d'accéder à leur dossier, ainsi que les courriers en attente.",
    );
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());
  }
}
