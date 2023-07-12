import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-cgu",
  styleUrls: ["./cgu.component.css"],
  templateUrl: "./cgu.component.html",
})
export class CguComponent implements OnInit {
  constructor(private readonly titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle("Conditions générales d'utilisation");
  }
}
