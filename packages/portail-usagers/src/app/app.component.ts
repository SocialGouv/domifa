import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public title: string;
  public apiVersion: string | null;

  constructor(private titleService: Title) {
    this.apiVersion = null;
    this.title = "Bienvenue sur le portail usager de Domifa";
  }
  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, l'outil qui facilite la gestion des structures domiciliatirices"
    );
  }
  private runHealthCheckAndAutoReload() {}
}
