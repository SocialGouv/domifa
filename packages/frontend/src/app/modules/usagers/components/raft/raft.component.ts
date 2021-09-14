import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { MOTIFS_RADIATION_LABELS } from "../../../../../_common/model/usager/constants/MOTIFS_RADIATION_LABELS.const";
import { UsagerDecisionMotif } from "../../../../../_common/model/usager/UsagerDecisionMotif.type";
import { UsagerService } from "../../services/usager.service";
import { UsagerFormModel } from "../form/UsagerFormModel";

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
    private usagerService: UsagerService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private notifService: ToastrService
  ) {}

  public ngOnInit() {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.user = user;
    });

    this.titleService.setTitle("Radier un domicilié");
    if (this.route.snapshot.params.id) {
      this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
        (usager: UsagerLight) => {
          const usagerModel = new UsagerFormModel(usager);
          if (!usagerModel.isActif) {
            this.notifService.error("Vous ne pouvez pas radier ce domicilié");
            this.router.navigate(["profil/general/" + usager.ref]);
          } else {
            this.usager = usagerModel;
          }
        },
        () => {
          this.notifService.error(
            "Le dossier que vous recherchez n'existe pas"
          );
          this.router.navigate(["/404"]);
        }
      );
    } else {
      this.notifService.error("Le dossier que vous recherchez n'existe pas");
      this.router.navigate(["/404"]);
    }
  }

  public setRadiation() {
    this.usagerService
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
