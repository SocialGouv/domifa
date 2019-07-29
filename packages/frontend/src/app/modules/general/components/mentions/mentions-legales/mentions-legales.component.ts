import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-mentions-legales",
  styleUrls: ["./mentions-legales.component.css"],
  templateUrl: "./mentions-legales.component.html"
})
export class MentionsLegalesComponent implements OnInit {
  public title: string;
  public ngOnInit() {
    this.title = "Mentions-légales de Domifa";
  }
}
