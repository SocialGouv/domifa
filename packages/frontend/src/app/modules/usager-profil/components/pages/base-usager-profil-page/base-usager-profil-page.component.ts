import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UsagerLight } from "../../../../../../_common/model";
import { selectUsagerById, UsagerState } from "../../../../../shared";
import { AuthService, CustomToastService } from "../../../../shared/services";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { Store } from "@ngrx/store";
import { UserStructure, getUsagerNomComplet } from "@domifa/common";

@Component({
  selector: "app-base-usager-profil-page",
  templateUrl: "./base-usager-profil-page.component.html",
})
export class BaseUsagerProfilPageComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public usager!: UsagerFormModel;
  public subscription = new Subscription();
  public titlePrefix: string;

  constructor(
    protected readonly authService: AuthService,
    protected readonly usagerProfilService: UsagerProfilService,
    protected readonly titleService: Title,
    protected readonly toastService: CustomToastService,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly store: Store<UsagerState>
  ) {
    this.me = this.authService.currentUserValue;
    this.titlePrefix = "";
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    this.subscription.add(
      this.store.select(selectUsagerById(id)).subscribe({
        next: (usager: UsagerLight) => {
          if (usager) {
            this.usager = new UsagerFormModel(usager);
            this.setTitle();
          }
        },
      })
    );

    this.subscription.add(
      this.usagerProfilService.findOne(id).subscribe({
        error: () => {
          this.toastService.error("Le dossier recherché n'existe pas");
          this.router.navigate(["404"]);
        },
      })
    );
  }

  public setTitle() {
    this.titleService.setTitle(
      `${this.titlePrefix} de ${getUsagerNomComplet(this.usager)} - DomiFa`
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
