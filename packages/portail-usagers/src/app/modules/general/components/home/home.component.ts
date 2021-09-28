import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { MatomoTracker } from "ngx-matomo";

import { HomeService } from "./home.service";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  constructor(
    private titleService: Title,
    private homeService: HomeService,
    public matomo: MatomoTracker
  ) {}

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, faciliter la vie des organismes domiciliataires"
    );
  }
}
