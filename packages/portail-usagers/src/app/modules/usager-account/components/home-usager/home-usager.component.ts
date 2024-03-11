import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { PortailUsagerProfile } from "@domifa/common";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-home-usager",
  templateUrl: "./home-usager.component.html",
  styleUrls: ["./home-usager.component.css"],
})
export class HomeUsagerComponent implements OnInit {
  public usagerProfile!: PortailUsagerProfile | null;

  constructor(
    private readonly usagerAuthService: UsagerAuthService,
    private readonly titleService: Title,
    private readonly router: Router,
  ) {
    this.usagerProfile = null;
    this.titleService.setTitle("Mon DomiFa");
  }

  public ngOnInit(): void {
    this.usagerAuthService.currentUsagerSubject.subscribe(
      (apiResponse: PortailUsagerProfile | null) => {
        if (!apiResponse?.acceptTerms) {
          this.router.navigate(["/account/accept-terms"]);
          return;
        }

        this.usagerProfile = apiResponse;
      },
    );
  }
}
