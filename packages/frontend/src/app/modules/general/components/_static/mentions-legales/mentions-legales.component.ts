import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-mentions-legales",
  templateUrl: "./mentions-legales.component.html",
})
export class MentionsLegalesComponent implements OnInit {
  public constructor(private titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle("Mentions-légales de DomiFa");
  }
}
