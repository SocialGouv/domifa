import { HttpClient } from "@angular/common/http";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: "app-news",
  styleUrls: ["./news.component.css"],
  templateUrl: "./news.component.html"
})
export class NewsComponent implements OnInit {
  public title: string;
  public domifaNews: [];
  public newsLabels: any;
  public newsCenter: TemplateRef<any>;
  private newsJson = "assets/files/news.json";

  constructor(private http: HttpClient) {}

  public ngOnInit() {
    this.newsLabels = {
      bug: "Petites améliorations",
      new: "Nouveauté"
    };

    this.getJSON().subscribe(domifaNews => {
      this.domifaNews = domifaNews;
    });

    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.newsJson);
  }
}
