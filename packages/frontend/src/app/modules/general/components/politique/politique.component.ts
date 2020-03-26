import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-politique",
  templateUrl: "./politique.component.html",
  styleUrls: ["./politique.component.css"],
})
export class PolitiqueComponent {
  public title: string;
  public constructor() {
    this.title = "Politique de confidentialité";
  }
}
