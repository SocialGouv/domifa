import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-not-found",
  styleUrls: ["./not-found.component.css"],
  templateUrl: "./not-found.component.html"
})
export class NotFoundComponent implements OnInit {
  public title: string;
  public ngOnInit() {
    this.title = "La page que vous recherchez n'éxiste pas";
  }
}
