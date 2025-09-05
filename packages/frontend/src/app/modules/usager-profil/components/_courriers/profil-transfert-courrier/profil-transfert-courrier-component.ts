import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../../_common/model";
import {
  endDateAfterBeginDateValidator,
  formatDateToNgb,
  NoWhiteSpaceValidator,
  parseDateFromNgb,
} from "../../../../../shared";
import { CustomToastService } from "../../../../shared/services";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagerOptionsService } from "../../../services/usager-options.service";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-profil-transfert-courrier",
  templateUrl: "./profil-transfert-courrier.html",
})
export class UsagersProfilTransfertCourrierComponent implements OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure;

  public isFormVisible: boolean;
  public loading: boolean;
  public submitted: boolean;

  public transfertForm!: UntypedFormGroup;

  @ViewChild("confirmDelete", { static: true })
  public confirmDelete!: TemplateRef<NgbModalRef>;

  @ViewChild("transfertName")
  public firstInput!: ElementRef;

  private readonly subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly modalService: NgbModal,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.isFormVisible = false;
    this.loading = false;
    this.submitted = false;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.transfertForm.controls;
  }

  public showForm(): void {
    this.isFormVisible = true;
    this.initForm();
    this.transfertForm.reset(this.transfertForm.value);
    this.changeDetectorRef.detectChanges();
    const elementToFocus = this.firstInput?.nativeElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }
  }

  public hideForm(): void {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
    this.transfertForm.reset(this.transfertForm.value);
  }

  public initForm(): void {
    this.transfertForm = this.formBuilder.group(
      {
        nom: [
          this.usager.options.transfert.nom,
          [Validators.required, NoWhiteSpaceValidator],
        ],
        adresse: [
          this.usager.options.transfert.adresse,
          [
            Validators.required,
            Validators.minLength(10),
            NoWhiteSpaceValidator,
          ],
        ],
        dateFin: [
          this.usager.options.transfert.dateFin
            ? formatDateToNgb(this.usager.options.transfert.dateFin)
            : null,
          [Validators.required],
        ],
        dateDebut: [
          this.usager.options.transfert.dateDebut
            ? formatDateToNgb(this.usager.options.transfert.dateDebut)
            : null,
          [Validators.required],
        ],
      },
      {
        validators: endDateAfterBeginDateValidator,
      }
    );
  }

  public editTransfert(): void {
    this.submitted = true;
    if (this.transfertForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    const formValue = {
      actif: true,
      ...this.transfertForm.value,
      dateFin: parseDateFromNgb(this.transfertForm.controls.dateFin.value),
      dateDebut: parseDateFromNgb(this.transfertForm.controls.dateDebut.value),
    };

    this.loading = true;

    this.subscription.add(
      this.usagerOptionsService
        .editTransfert(formValue, this.usager.ref)
        .subscribe({
          next: () => {
            this.hideForm();
            this.toastService.success("Transfert modifié avec succès");
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'ajouter le transfert'");
          },
        })
    );
  }

  public openConfirmation(): void {
    this.modalService.open(this.confirmDelete, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public deleteTransfert(): void {
    if (!this.usager.options.transfert.actif) {
      this.hideForm();
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.usagerOptionsService.deleteTransfert(this.usager.ref).subscribe({
        next: () => {
          this.toastService.success("Transfert supprimé avec succès");

          setTimeout(() => {
            this.closeModals();
            this.hideForm();
            this.transfertForm.reset();
            this.submitted = false;
          }, 500);
        },
        error: () => {
          this.toastService.error("Impossible de supprimer le transfert");
        },
      })
    );
  }
}
