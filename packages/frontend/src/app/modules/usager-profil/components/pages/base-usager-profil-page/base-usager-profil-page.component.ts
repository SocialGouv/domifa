import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import {
  UserStructure,
  UsagerLight,
  UserStructureRole,
} from "../../../../../../_common/model";
import { getUsagerNomComplet } from "../../../../../shared";
import { AuthService, CustomToastService } from "../../../../shared/services";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../../services/usager-profil.service";

@Component({
  selector: "app-base-usager-profil-page",
  templateUrl: "./base-usager-profil-page.component.html",
  styleUrls: ["./base-usager-profil-page.component.css"],
})
export class BaseUsagerProfilPageComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public usager!: UsagerFormModel;
  public subscription = new Subscription();
  public titlePrefix: string;
  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router
  ) {
    this.me = this.authService.currentUserValue;
    this.titlePrefix = "";
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.usagerProfilService
        .findOne(this.route.snapshot.params.id)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.usager = new UsagerFormModel(usager);
            this.setTitle();
          },
          error: () => {
            this.toastService.error("Le dossier recherché n'existe pas");
            this.router.navigate(["404"]);
          },
        })
    );
  }

  public setTitle() {
    this.titleService.setTitle(
      this.titlePrefix + " de " + getUsagerNomComplet(this.usager)
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me?.role === role;
  }
}
