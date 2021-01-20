import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { CountUpOptions } from "countup.js";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { AppUser } from "../../../../../_common/model";
import { HomeService } from "./home.service";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  public stats: any;
  public countOptions: CountUpOptions;

  public user: AppUser | null;

  constructor(
    private titleService: Title,
    private homeService: HomeService,
    private authenticationService: AuthService
  ) {
    this.countOptions = {
      duration: 2,
      separator: " ",
    };

    this.user = this.authenticationService.currentUserValue;
  }

  public ngOnInit() {
    this.titleService.setTitle(
      "Domifa, faciliter la vie des organismes domiciliataires"
    );

    this.homeService.getHomeStats().subscribe((stats: any) => {
      this.stats = stats;
    });
  }
}
