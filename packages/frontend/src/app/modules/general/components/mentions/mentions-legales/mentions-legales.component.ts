import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-mentions-legales",
  styleUrls: ["./mentions-legales.component.css"],
  templateUrl: "./mentions-legales.component.html",
})
export class MentionsLegalesComponent implements OnInit {
  public constructor(private titleService: Title) {}
  public ngOnInit() {
    this.titleService.setTitle("Mentions-légales de Domifa");
  }
}
