import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { HomeService } from "./home.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { User } from "src/app/modules/users/interfaces/user";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  public stats: any;
  public countOptions: any;

  public user: User | null;

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
