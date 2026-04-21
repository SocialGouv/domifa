import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-mentions-legales",
  standalone: true,
  templateUrl: "./mentions-legales.component.html",
})
export class MentionsLegalesComponent {
  private readonly titleService = inject(Title);

  constructor() {
    this.titleService.setTitle("Mentions-légales de DomiFa");
  }
}
