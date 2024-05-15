import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { Store } from "@ngrx/store";
import { UsagerLight } from "../../../../../_common/model";
import { selectUsagerByRef, getUsagerNomComplet } from "../../../../shared";
import { AuthService, CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { Usager, UserStructure } from "@domifa/common";

@Component({
  selector: "app-base-usager-dossier-page",
  templateUrl: "./base-usager-dossier-page.component.html",
})
export class BaseUsagerDossierPageComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public subscription = new Subscription();
  public titlePrefix: string;
  public currentUserSubject$: Observable<UserStructure | null>;
  public usager!: UsagerFormModel;
  public submitted = false;
  public loading = false;

  constructor(
    protected readonly authService: AuthService,
    protected readonly usagerDossierService: UsagerDossierService,
    protected readonly titleService: Title,
    protected readonly toastService: CustomToastService,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly store: Store
  ) {
    this.me = this.authService.currentUserValue;
    this.currentUserSubject$ = this.authService.currentUserSubject;
    this.titlePrefix = "";
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    this.subscription.add(
      this.store
        .select(selectUsagerByRef(id))
        .subscribe((usager: UsagerLight) => {
          if (usager) {
            this.usager = new UsagerFormModel(usager);
          }
        })
    );

    this.subscription.add(
      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: Usager) => {
          this.usager = new UsagerFormModel(usager);
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
      this.titlePrefix + " de " + getUsagerNomComplet(this.usager) + " - DomiFa"
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
