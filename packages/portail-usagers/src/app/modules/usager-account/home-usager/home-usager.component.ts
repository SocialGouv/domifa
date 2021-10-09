import { UsagerAuthService } from "./../../usager-auth/services/usager-auth.service";
import { Component, OnInit } from "@angular/core";
import { PortailUsagerProfile } from "../../../../_common";

@Component({
  selector: "app-home-usager",
  templateUrl: "./home-usager.component.html",
  styleUrls: ["./home-usager.component.css"],
})
export class HomeUsagerComponent implements OnInit {
  public usagerProfile!: PortailUsagerProfile | null;

  constructor(private readonly usagerAuthService: UsagerAuthService) {
    this.usagerProfile = null;
  }

  public ngOnInit(): void {
    this.usagerAuthService.currentUsagerSubject.subscribe(
      (usager: PortailUsagerProfile | null) => {
        this.usagerProfile = usager;
      },
    );
  }
}
