import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { HomeService } from "./home.service";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  public stats: any;
  public countOptions: any;

  constructor(private titleService: Title, private homeService: HomeService) {
    this.countOptions = {
      duration: 2,
      separator: " ",
    };
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
