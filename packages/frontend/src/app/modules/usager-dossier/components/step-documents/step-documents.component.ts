import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  selector: "app-usager-documents-form",
  templateUrl: "./step-documents.component.html",
})
export class StepDocumentsComponent implements OnInit {
  public usager!: UsagerFormModel;

  public me!: UserStructure;
  public loading = false;

  constructor(
    private usagerDossierService: UsagerDossierService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
    public toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

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
      });
    } else {
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number): void {
    this.loading = true;
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
    });
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
