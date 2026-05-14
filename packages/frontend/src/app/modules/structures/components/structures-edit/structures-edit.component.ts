import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { saveAs } from "file-saver";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { AuthService } from "../../../shared/services/auth.service";
import { StructureService } from "../../services/structure.service";
import {
  UserStructure,
  StructureCommon,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";
import { Store } from "@ngrx/store";
import { usagerActions, UsagerState } from "../../../../shared";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-structures-edit",
  templateUrl: "./structures-edit.component.html",
  standalone: false,
})
export class StructuresEditComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public structure!: StructureCommon;

  public exportLoading: boolean;
  public loading: boolean;

  private readonly subscription = new Subscription();
  public readonly UsagersFilterCriteriaStatut = UsagersFilterCriteriaStatut;

  @ViewChild("hardResetModal", { static: false })
  public hardResetModal!: DsfrModalComponent;

  constructor(
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly store: Store<UsagerState>
  ) {
    this.exportLoading = false;
    this.loading = false;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    this.titleService.setTitle(
      "Modifier les informations de votre structure sur DomiFa"
    );

    this.subscription.add(
      this.structureService
        .findMyStructure()
        .subscribe((structure: StructureCommon) => {
          this.structure = structure;
        })
    );
  }

  public openHardResetModal(): void {
    this.hardResetModal.open();
  }

  public closeModals(): void {
    this.hardResetModal?.close();
  }

  public hardResetConfirm(): void {
    this.loading = true;
    this.subscription.add(
      this.structureService.hardResetConfirm().subscribe({
        next: () => {
          this.toastService.success(
            "La remise à zéro a été effectuée avec succès !"
          );
          this.store.dispatch(usagerActions.clearCache());

          setTimeout(() => {
            this.closeModals();
            this.loading = false;
          }, 1000);
        },
        error: (err) => {
          this.loading = false;
          if (err?.error?.code === "OTP_CANCELLED") {
            return;
          }
          this.toastService.error(
            "La remise à zéro n'a pas pu être effectuée !"
          );
        },
      })
    );
  }

  public export(statut: UsagersFilterCriteriaStatut): void {
    this.exportLoading = true;
    this.subscription.add(
      this.structureService.export(statut).subscribe({
        next: (x: Blob) => {
          const newBlob = new Blob([x], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          saveAs(newBlob, "export_domifa" + ".xlsx");
          setTimeout(() => {
            this.exportLoading = false;
          }, 1000);
        },
        error: () => {
          this.toastService.error(
            "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.exportLoading = false;
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
