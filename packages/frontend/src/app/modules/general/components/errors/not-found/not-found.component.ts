import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-not-found",
  styleUrls: ["./not-found.component.css"],
  templateUrl: "./not-found.component.html",
})
export class NotFoundComponent implements OnInit {
  constructor(private readonly titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle(
      "La page que vous recherchez n'éxiste pas sur DomiFa"
    );
  }
}
