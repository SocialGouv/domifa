import { SeoService } from "./../../../shared/services/seo.service";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NEWS_LABELS } from "./../../../../shared/constants/NEWS_LABELS.const";
import { Component, OnInit, TemplateRef } from "@angular/core";
import DOMIFA_NEWS from "../../../../../assets/files/news.json";

@Component({
  selector: "app-news",
  styleUrls: ["./news.component.css"],
  templateUrl: "./news.component.html",
})
export class NewsComponent implements OnInit {
  public NEWS_LABELS = NEWS_LABELS;
  public DOMIFA_NEWS = DOMIFA_NEWS;
  public newsCenter!: TemplateRef<NgbModalRef>;

  public constructor(private seoService: SeoService) {}

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Les dernières nouveautés de Domifa",
      "Domifa est une startup d'état qui développe de nouvelles fonctionnalités en continue pour améliorer le produit"
    );
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());
  }
}
