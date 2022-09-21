import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-usager-dossier-step-entretien",
  templateUrl: "./step-entretien.component.html",
})
export class StepEntretienComponent implements OnInit {
  public usager!: UsagerFormModel;
  public me!: UserStructure;

  constructor(
    private usagerDossierService: UsagerDossierService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
    private toastr: CustomToastService
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
            "Entretien avec  " + usager.nom + " " + usager.prenom
          );
          this.usager = new UsagerFormModel(usager);
        },
        error: () => {
          this.toastr.error("Le dossier recherché n'existe pas");
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.toastr.error("Le dossier recherché n'existe pas");
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number): void {
    this.usagerDossierService.nextStep(this.usager.ref, step).subscribe({
      next: (usager: UsagerLight) => {
        this.router.navigate(["usager/" + usager.ref + "/edit/documents"]);
      },
      error: () => {
        this.toastr.error("Une erreure inattendue est survenue");
      },
    });
  }
}
