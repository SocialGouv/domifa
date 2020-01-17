import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-not-found",
  styleUrls: ["./not-found.component.css"],
  templateUrl: "./not-found.component.html"
})
export class NotFoundComponent {
  public title: string;
  constructor() {
    this.title = "La page que vous recherchez n'éxiste pas";
  }
}
