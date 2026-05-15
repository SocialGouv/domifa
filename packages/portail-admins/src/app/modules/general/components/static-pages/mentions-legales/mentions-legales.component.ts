import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-mentions-legales",
  templateUrl: "./mentions-legales.component.html",
  standalone: false,
})
export class MentionsLegalesComponent implements OnInit {
  public constructor(private readonly titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle("Mentions-légales de DomiFa");
  }
}
