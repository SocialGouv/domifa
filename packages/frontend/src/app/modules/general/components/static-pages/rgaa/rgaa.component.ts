import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-rgaa",
  templateUrl: "./rgaa.component.html",
})
export class RgaaComponent {
  constructor(private readonly titleService: Title) {
    this.titleService.setTitle("Déclaration d’accessibilité");
  }
}
