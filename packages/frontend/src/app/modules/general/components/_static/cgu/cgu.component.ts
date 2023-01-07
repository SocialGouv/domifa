import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-cgu",
  styleUrls: ["./cgu.component.css"],
  templateUrl: "./cgu.component.html",
})
export class CguComponent implements OnInit {
  public portailUsagerUrl = environment.portailUsagersUrl;

  constructor(private titleService: Title) {}
  public ngOnInit(): void {
    this.titleService.setTitle("Conditions générales d'utilisation");
  }
}