import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-politique",
  templateUrl: "./politique.component.html",
})
export class PolitiqueComponent implements OnInit {
  public constructor(private titleService: Title) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Politique de confidentialité de DomiFa");
  }
}
