import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-rgaa",
  templateUrl: "./rgaa.component.html",
})
export class RgaaComponent implements OnInit {
  constructor(private readonly titleService: Title) {}
  ngOnInit(): void {
    this.titleService.setTitle("Déclaration d’accessibilité");
  }
}
