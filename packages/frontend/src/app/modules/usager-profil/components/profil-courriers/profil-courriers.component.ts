import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UserStructure, UsagerLight } from "../../../../../_common/model";
import { getUsagerNomComplet } from "../../../../shared/getUsagerNomComplet";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-courriers",
  templateUrl: "./profil-courriers.component.html",
  styleUrls: ["./profil-courriers.component.css"],
})
export class ProfilCourriersComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public usager!: UsagerFormModel | null;
  private subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.me = null;
    this.usager = null;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    this.subscription.add(
      this.usagerProfilService.findOne(this.route.snapshot.params.id).subscribe(
        (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);

          this.titleService.setTitle(
            "Courriers de " + getUsagerNomComplet(usager)
          );
        },
        () => {
          this.toastService.error("Le dossier recherché n'existe pas");
          this.router.navigate(["404"]);
        }
      )
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
