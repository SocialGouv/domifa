import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-root",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  public title: string;
  public isAuth = false;
  public isNavbarCollapsed = false;

  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      this.isAuth = user !== null;
    });
  }

  public ngOnInit() {
    this.title = "Domifa";
  }
}
