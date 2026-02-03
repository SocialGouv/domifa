import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { UsagerLight } from "../../../../../_common/model";
import { selectUsagerById, UsagerState } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { ETAPES_FORM_DOM_TITRES } from "../../constants";
import { getPersonFullName } from "@domifa/common";

@Component({
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.scss"],
})
export class StepHeaderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public currentStep!: number;

  public nbNotes = 0;
  public currentUrl = "";

  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly store: Store<UsagerState>
  ) {}

  public ngOnInit(): void {
    if (
      this.usager.decision.statut !== "ATTENTE_DECISION" &&
      this.usager.decision.statut !== "INSTRUCTION"
    ) {
      this.toastService.warning(
        "Vous ne pouvez pas revenir sur une décision déjà prise"
      );
      this.router.navigate([`/profil/general/${this.usager.ref}`]);
      return;
    }

    if (
      this.usager.decision.statut === "ATTENTE_DECISION" &&
      this.currentStep !== 4
    ) {
      this.router.navigate([`usager/${this.usager.ref}/edit/decision`]);
      return;
    }

    let title = "Création de demande";

    if (this.usager.uuid) {
      title =
        this.usager.typeDom === "RENOUVELLEMENT"
          ? "Renouvellement de "
          : "Création de demande de ";

      title += getPersonFullName(this.usager);
    }

    title +=
      ", étape " +
      (this.currentStep + 1) +
      " sur 5, " +
      ETAPES_FORM_DOM_TITRES[this.currentStep] +
      " - DomiFa";

    this.titleService.setTitle(title);

    this.subscription.add(
      this.store
        .select(selectUsagerById(this.usager.ref))
        .subscribe((usager: UsagerLight) => {
          this.nbNotes = usager?.nbNotes ?? 0;
        })
    );

    this.currentUrl = this.router.url;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
