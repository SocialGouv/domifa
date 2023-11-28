import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-cgu",
  templateUrl: "./cgu.component.html",
})
export class CguComponent {
  constructor(private readonly titleService: Title) {
    this.titleService.setTitle("Conditions générales d'utilisation");
  }
}
