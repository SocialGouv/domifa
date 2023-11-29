import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-cgu",
  templateUrl: "./cgu.component.html",
})
export class CguComponent {
  public portailUsagerUrl = environment.portailUsagersUrl;

  constructor(private readonly titleService: Title) {
    this.titleService.setTitle("Conditions générales d'utilisation de DomiFa");
  }
}
