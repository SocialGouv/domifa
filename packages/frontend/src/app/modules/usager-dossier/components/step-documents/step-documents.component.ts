import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { BaseUsagerDossierPageComponent } from "../base-usager-dossier-page/base-usager-dossier-page.component";

@Component({
  selector: "app-usager-documents-form",
  templateUrl: "./step-documents.component.html",
})
export class StepDocumentsComponent extends BaseUsagerDossierPageComponent {
  constructor(
    public authService: AuthService,
    public usagerDossierService: UsagerDossierService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store
  ) {
    super(
      authService,
      usagerDossierService,
      titleService,
      toastService,
      route,
      router,
      store
    );
    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  public nextStep(step: number): void {
    this.loading = true;
    this.subscription.add(
      this.usagerDossierService.nextStep(this.usager.ref, step).subscribe({
        next: (usager: UsagerLight) => {
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
}
