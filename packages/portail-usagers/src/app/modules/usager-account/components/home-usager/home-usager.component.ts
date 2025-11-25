import { Component, OnInit } from "@angular/core";
import { PortailUsagerProfile, StructureInformation } from "@domifa/common";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { StructureInformationService } from "../../services/structure-information.service";
import { SeoService } from "../../../shared/services/seo.service";

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
    private readonly seoService: SeoService,
    private readonly router: Router,
    private readonly structureInformationService: StructureInformationService
  ) {
    this.usagerProfile = null;
    this.seoService.updateTitleAndTags(
      "Mon DomiFa - le portail des domiciliés !",
      "Consultez votre dossier de domiciliation, vos courriers en attente et les informations de votre structure"
    );
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.usagerAuthService.currentUsagerSubject.subscribe(
        (apiResponse: PortailUsagerProfile | null) => {
          if (apiResponse && !apiResponse?.acceptTerms) {
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
