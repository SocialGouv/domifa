import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-politique",
  templateUrl: "./politique.component.html",
  styleUrls: ["./politique.component.css"],
})
export class PolitiqueComponent implements OnInit {
  public constructor(private titleService: Title) {}

  public ngOnInit() {
    this.titleService.setTitle("Politique de confidentialité");
  }
}
