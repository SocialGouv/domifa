import { SeoService } from "./../../../shared/services/seo.service";

import { Component, OnInit } from "@angular/core";
import DOMIFA_NEWS from "../../../../../assets/files/news.json";

@Component({
  selector: "app-news",
  styleUrls: ["./news.component.css"],
  templateUrl: "./news.component.html",
})
export class NewsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly DOMIFA_NEWS: any = DOMIFA_NEWS;

  public years: string[] = [];
  public selectedYear: string = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public filteredNews: any[] = [];

  public constructor(private readonly seoService: SeoService) {}

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Les dernières nouveautés de DomiFa",
      "DomiFa est une startup d'état qui développe de nouvelles fonctionnalités en continue pour améliorer le produit"
    );
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());

    const yearSet = new Set<string>();
    for (const news of this.DOMIFA_NEWS) {
      yearSet.add(news.date.substring(0, 4));
    }
    this.years = Array.from(yearSet).sort((a, b) => b.localeCompare(a));
    this.selectYear(this.years[0]);
  }

  public selectYear(year: string): void {
    this.selectedYear = year;
    this.filteredNews = this.DOMIFA_NEWS.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (news: any) => news.date.substring(0, 4) === year
    );
  }
}
