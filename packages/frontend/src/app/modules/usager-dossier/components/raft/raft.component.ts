import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  UserStructure,
  UsagerLight,
  UsagerDecisionMotif,
} from "../../../../../_common/model";
import { MOTIFS_RADIATION_LABELS } from "../../../../../_common/model/usager/constants/MOTIFS_RADIATION_LABELS.const";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  selector: "app-raft",
  styleUrls: ["./raft.component.css"],
  templateUrl: "./raft.component.html",
})
export class RaftComponent implements OnInit {
  public usager: UsagerFormModel;
  public user: UserStructure;

  public MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  constructor(
    private usagerDossierService: UsagerDossierService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private notifService: ToastrService
  ) {
    this.usager = null;
    this.user = null;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.user = user;
    });

    this.titleService.setTitle("Radier un domicilié");
    if (this.route.snapshot.params.id) {
      this.usagerDossierService
        .findOne(this.route.snapshot.params.id)
        .subscribe({
          next: (usager: UsagerLight) => {
            const usagerModel = new UsagerFormModel(usager);
            if (!usagerModel.isActif) {
              this.notifService.error("Vous ne pouvez pas radier ce domicilié");
              this.router.navigate(["profil/general/" + usager.ref]);
            } else {
              this.usager = usagerModel;
            }
          },
          error: () => {
            this.notifService.error(
              "Le dossier que vous recherchez n'existe pas"
            );
            this.router.navigate(["/404"]);
          },
        });
    } else {
      this.notifService.error("Le dossier que vous recherchez n'existe pas");
      this.router.navigate(["/404"]);
    }
  }

  public setRadiation(): void {
    this.usagerDossierService
      .setDecision(this.usager.ref, {
        statut: "RADIE",
        motif: this.usager.decision.motif as UsagerDecisionMotif,
        motifDetails: this.usager.decision.motifDetails,
      })
      .subscribe({
        next: (usager: UsagerLight) => {
          this.notifService.success("Radiation enregistrée avec succès ! ");
          this.router.navigate(["profil/general/" + usager.ref]);
        },
        error: () => {
          this.notifService.error("Une erreur est survenue");
        },
      });
  }
}
