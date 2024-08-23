import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight } from "../../../../../_common/model";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { Subscription } from "rxjs";
import { BaseUsagerDossierPageComponent } from "../base-usager-dossier-page/base-usager-dossier-page.component";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { UsagerState } from "../../../../shared";

@Component({
  selector: "app-usager-dossier-step-entretien",
  templateUrl: "./step-entretien.component.html",
})
export class StepEntretienComponent
  extends BaseUsagerDossierPageComponent
  implements OnInit, OnDestroy
{
  public usager!: UsagerFormModel;
  public subscription = new Subscription();

  constructor(
    public authService: AuthService,
    public usagerDossierService: UsagerDossierService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store<UsagerState>
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
  }

  public nextStep(step: number): void {
    this.subscription.add(
      this.usagerDossierService.nextStep(this.usager.ref, step).subscribe({
        next: (usager: UsagerLight) => {
          this.router.navigate(["usager/" + usager.ref + "/edit/documents"]);
        },
        error: () => {
          this.toastService.error("Une erreure inattendue est survenue");
        },
      })
    );
  }
}
