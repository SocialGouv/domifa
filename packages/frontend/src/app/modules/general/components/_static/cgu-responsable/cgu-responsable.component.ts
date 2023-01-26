import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-cgu-responsable",
  templateUrl: "./cgu-responsable.component.html",
})
export class CguResponsableComponent implements OnInit {
  public portailUsagerUrl = environment.portailUsagersUrl;

  constructor(private titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle(
      "Conditions d’utilisation de DomiFa – Responsable de structure"
    );
  }
}
