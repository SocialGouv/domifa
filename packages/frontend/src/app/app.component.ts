import { AfterViewInit, Component, OnInit } from "@angular/core";
import { of } from "rxjs";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  public title: string;
  public isNavbarCollapsed = false;

  constructor(private authService: AuthService) {}

  public ngOnInit() {
    this.title = "Domifa";
    this.authService.isAuth().subscribe(isAllowed => {});
  }
}
