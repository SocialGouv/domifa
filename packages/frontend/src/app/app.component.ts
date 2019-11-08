import { Component, OnInit } from "@angular/core";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { AuthService } from "src/app/services/auth.service";
import { fadeInOut } from "./shared/animations";

@Component({
  animations: [fadeInOut],
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  public title: string;
  public help: boolean = false;
  public isNavbarCollapsed: boolean = false;
  public isAllowed: any;

  constructor(
    public readonly authService: AuthService,
    private matomoInjector: MatomoInjector,
    private matomoTracker: MatomoTracker
  ) {
    this.matomoInjector.init(
      "https://matomo.tools.factory.social.gouv.fr/",
      17
    );
  }
  public ngOnInit() {
    this.title = "Domifa";
    this.help = false;

    this.matomoTracker.setUserId("0");

    this.authService.isAuth().subscribe(isAllowed => {
      this.isAllowed = isAllowed;
    });
  }
}
