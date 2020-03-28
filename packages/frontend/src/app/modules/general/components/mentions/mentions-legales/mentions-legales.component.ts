import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-mentions-legales",
  styleUrls: ["./mentions-legales.component.css"],
  templateUrl: "./mentions-legales.component.html",
})
export class MentionsLegalesComponent {
  public title: string;
  public constructor() {
    this.title = "Mentions-légales de Domifa";
  }
}
