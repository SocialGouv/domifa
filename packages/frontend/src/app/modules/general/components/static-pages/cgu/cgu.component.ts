import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-cgu",
  standalone: true,
  templateUrl: "./cgu.component.html",
})
export class CguComponent {
  public portailUsagerUrl = environment.portailUsagersUrl;

  private readonly titleService = inject(Title);

  constructor() {
    this.titleService.setTitle("Conditions générales d'utilisation de DomiFa");
  }
}
