import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-cgu",
  styleUrls: ["./cgu.component.css"],
  templateUrl: "./cgu.component.html",
})
export class CguComponent {
  public title: string;
  constructor() {
    this.title = "Conditions générales d'utilisation de Domifa";
  }
}
