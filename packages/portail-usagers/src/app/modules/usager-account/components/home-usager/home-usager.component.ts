import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { PortailUsagerProfile, StructureInformation } from "@domifa/common";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { StructureInformationService } from "../../services/structure-information.service";

@Component({
  selector: "app-home-usager",
  templateUrl: "./home-usager.component.html",
})
export class HomeUsagerComponent implements OnInit {
  public usagerProfile!: PortailUsagerProfile | null;
  private readonly subscription = new Subscription();
  public structureInformation: StructureInformation[] = [];

  constructor(
    private readonly usagerAuthService: UsagerAuthService,
    private readonly titleService: Title,
    private readonly router: Router,
    private readonly structureInformationService: StructureInformationService
  ) {
    this.usagerProfile = null;
    this.titleService.setTitle("Mon DomiFa");
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.usagerAuthService.currentUsagerSubject.subscribe(
        (apiResponse: PortailUsagerProfile | null) => {
          if (!apiResponse?.acceptTerms) {
            this.router.navigate(["/account/accept-terms"]);
            return;
          }
          this.usagerProfile = apiResponse;
        }
      )
    );

    if (this.usagerProfile) {
      this.getStructureInformation();
    }
  }

  public getStructureInformation() {
    this.subscription.add(
      this.structureInformationService.getAllStructureInformation().subscribe({
        next: (structureInformation: StructureInformation[]) => {
          this.structureInformation = structureInformation.filter(
            (info) => !info.isExpired
          );
        },
      })
    );
  }
}
