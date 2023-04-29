import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import {
  Usager,
  UsagerLight,
  UserStructure,
} from "../../../../../_common/model";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { Observable, Subscription } from "rxjs";

@Component({
  selector: "app-usager-dossier-step-entretien",
  templateUrl: "./step-entretien.component.html",
})
export class StepEntretienComponent implements OnInit, OnDestroy {
  public usager!: UsagerFormModel;
  public currentUserSubject$: Observable<UserStructure | null>;
  private subscription = new Subscription();

  constructor(
    private readonly usagerDossierService: UsagerDossierService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toastr: CustomToastService
  ) {
    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  public ngOnInit(): void {
    this.currentUserSubject$ = this.authService.currentUserSubject;

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.subscription.add(
        this.usagerDossierService.findOne(id).subscribe({
          next: (usager: Usager) => {
            this.usager = new UsagerFormModel(usager);
          },
          error: () => {
            this.toastr.error("Le dossier recherché n'existe pas");
            this.router.navigate(["404"]);
          },
        })
      );
    } else {
      this.toastr.error("Le dossier recherché n'existe pas");
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number): void {
    this.subscription.add(
      this.usagerDossierService.nextStep(this.usager.ref, step).subscribe({
        next: (usager: UsagerLight) => {
          this.router.navigate(["usager/" + usager.ref + "/edit/documents"]);
        },
        error: () => {
          this.toastr.error("Une erreure inattendue est survenue");
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
