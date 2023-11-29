import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-mentions-legales",
  templateUrl: "./mentions-legales.component.html",
})
export class MentionsLegalesComponent {
  public constructor(private readonly titleService: Title) {
    this.titleService.setTitle("Mentions-légales de DomiFa");
  }
}
