import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { Observable } from "rxjs";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-news",
  styleUrls: ["./news.component.css"],
  templateUrl: "./news.component.html",
})
export class NewsComponent implements OnInit {
  public domifaNews: any;
  public newsLabels: any;
  public newsCenter!: TemplateRef<any>;
  private newsJson = "assets/files/news.json";

  public constructor(private http: HttpClient, private titleService: Title) {}

  public ngOnInit() {
    this.titleService.setTitle("Les dernières mises à jour de Domifa");

    this.newsLabels = {
      bug: "Améliorations",
      new: "Nouveauté",
    };

    this.getJSON().subscribe((domifaNews) => {
      this.domifaNews = domifaNews;
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.newsJson);
  }
}
