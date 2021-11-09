import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  MOTIFS_RADIATION_LABELS,
  UsagerDecisionMotif,
  UsagerLight,
} from "../../../../../_common/model";
import { usagersCache } from "../../../../shared/store";
import { UsagerDossierService } from "../../../usager-dossier/services/usager-dossier.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-radiation-form",
  styleUrls: ["./radiation-form.component.css"],
  templateUrl: "./radiation-form.component.html",
})
export class RadiationFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output() public closeModals = new EventEmitter<void>();

  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  public MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  public loading: boolean;
  constructor(
    private usagerDossierService: UsagerDossierService,
    private router: Router,
    private notifService: ToastrService
  ) {
    this.loading = false;
  }

  public ngOnInit(): void {}

  public setRadiation(): void {
    this.loading = true;
    this.usagerDossierService
      .setDecision(this.usager.ref, {
        statut: "RADIE",
        motif: this.usager.decision.motif as UsagerDecisionMotif,
        motifDetails: this.usager.decision.motifDetails,
      })
      .subscribe({
        next: (newUsager: UsagerLight) => {
          this.notifService.success("Radiation enregistrée avec succès ! ");
          usagersCache.updateUsager(newUsager);
          this.usagerChange.emit(new UsagerFormModel(newUsager));
          this.closeModals.emit();
          this.loading = false;
        },
        error: () => {
          this.notifService.error(
            "Impossible de radier le domicilié, veuillez rééssayer ultérieurement"
          );
          this.loading = false;
        },
      });
  }
}
