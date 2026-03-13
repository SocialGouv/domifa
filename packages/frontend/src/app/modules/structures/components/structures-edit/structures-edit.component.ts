import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
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
})
export class StructuresEditComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;
  public structure!: StructureCommon;

  public exportLoading: boolean;
  public showHardReset: boolean;

  public loading: boolean;

  public hardResetForm!: UntypedFormGroup;
  private readonly subscription = new Subscription();
  public readonly UsagersFilterCriteriaStatut = UsagersFilterCriteriaStatut;

  @ViewChild("hardResetModal", { static: false })
  public hardResetModal!: DsfrModalComponent;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly store: Store<UsagerState>
  ) {
    this.showHardReset = false;
    this.exportLoading = false;
    this.loading = false;
  }

  public get h(): { [key: string]: AbstractControl } {
    return this.hardResetForm.controls;
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
          this.initForms();
        })
    );
  }

  public initForms(): void {
    this.hardResetForm = this.formBuilder.group({
      token: ["", [Validators.required]],
    });
  }

  public openHardResetModal(): void {
    this.hardResetModal.open();
  }

  public closeModals(): void {
    this.hardResetModal?.close();
  }

  public hardReset(): void {
    this.subscription.add(
      this.structureService.hardReset().subscribe(() => {
        this.showHardReset = true;
      })
    );
  }

  public hardResetConfirm(): void {
    if (this.hardResetForm.invalid) {
      this.toastService.error("Veuillez vérifier le formulaire");
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.structureService
        .hardResetConfirm(this.hardResetForm.controls.token.value)
        .subscribe({
          next: () => {
            this.toastService.success(
              "La remise à zéro a été effectuée avec succès !"
            );
            this.store.dispatch(usagerActions.clearCache());

            setTimeout(() => {
              this.closeModals();
              this.showHardReset = false;
              this.loading = false;
              this.hardResetForm.reset();
            }, 1000);
          },
          error: () => {
            this.loading = false;
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
