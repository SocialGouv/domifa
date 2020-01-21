import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html"
})
export class HomeComponent {
  public title: string;

  constructor() {
    this.title = "Domifa : faciliter la vie des CCAS";
  }
}
