import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-cgu",
  templateUrl: "./cgu.component.html",
})
export class CguComponent implements OnInit {
  public portailUsagerUrl = environment.portailUsagersUrl;

  constructor(private readonly titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle("Conditions générales d'utilisation de DomiFa");
  }
}
