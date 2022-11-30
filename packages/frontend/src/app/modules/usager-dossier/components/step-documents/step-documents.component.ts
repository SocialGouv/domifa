import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  selector: "app-usager-documents-form",
  templateUrl: "./step-documents.component.html",
})
export class StepDocumentsComponent implements OnInit, OnDestroy {
  public usager!: UsagerFormModel;

  public me!: UserStructure | null;
  public loading = false;
  private subscription = new Subscription();

  constructor(
    private readonly usagerDossierService: UsagerDossierService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.subscription.add(
        this.usagerDossierService.findOne(id).subscribe({
          next: (usager: UsagerLight) => {
            this.titleService.setTitle(
              "Pièces jointes du dossier de " + usager.nom + " " + usager.prenom
            );
            this.usager = new UsagerFormModel(usager);
          },
          error: () => {
            this.router.navigate(["404"]);
          },
        })
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number): void {
    this.loading = true;
    this.subscription.add(
      this.usagerDossierService.nextStep(this.usager.ref, step).subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
          this.router.navigate(["usager/" + usager.ref + "/edit/decision"]);
          this.toastService.success("Enregistrement réussi");
        },
        error: () => {
          this.toastService.error(
            "Une erreur empêche de passer à l'étape suivante."
          );
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
