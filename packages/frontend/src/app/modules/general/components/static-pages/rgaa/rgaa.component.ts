import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-rgaa",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./rgaa.component.html",
})
export class RgaaComponent {
  private readonly titleService = inject(Title);

  constructor() {
    this.titleService.setTitle("Déclaration d'accessibilité de DomiFa");
  }
}
