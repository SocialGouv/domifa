import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NEWS_LABELS } from "./../../../../shared/constants/NEWS_LABELS.const";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef } from "@angular/core";

import { Title } from "@angular/platform-browser";
@Component({
  selector: "app-news",
  styleUrls: ["./news.component.css"],
  templateUrl: "./news.component.html",
})
export class NewsComponent implements OnInit {
  public domifaNews: any;
  public newsLabels = NEWS_LABELS;
  public newsCenter!: TemplateRef<NgbModalRef>;
  private newsJson: string;

  public constructor(private http: HttpClient, private titleService: Title) {
    this.newsJson = "assets/files/news.json";
    this.domifaNews = null;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Les dernières mises à jour de Domifa");

    this.newsLabels = {
      bug: "Améliorations",
      new: "Nouveauté",
    };

    this.http.get(this.newsJson).subscribe((domifaNews) => {
      this.domifaNews = domifaNews;
    });
  }
}
