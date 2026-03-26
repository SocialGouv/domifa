import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";
import {
  endDateAfterBeginDateValidator,
  NoWhiteSpaceValidator,
} from "../../../../../shared";
import {
  MIN_DATE_NAISSANCE,
  getTodayFr,
  getTodayIso,
  formatDateToFr,
  parseFrDate,
} from "../../../../../shared";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";

import { UsagerOptionsService } from "../../../services/usager-options.service";
import { UserStructure, UsagerOptionsProcuration } from "@domifa/common";
import { CustomToastService } from "../../../../shared/services";

@Component({
  selector: "app-profil-procuration-courrier",
  templateUrl: "./profil-procuration-courrier.html",
})
export class UsagersProfilProcurationCourrierComponent
  implements OnInit, OnDestroy
{
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public me!: UserStructure;

  private readonly subscription = new Subscription();

  public isFormVisible: boolean;
  public submitted: boolean;
  public procurationToDelete: number;

  public procurationsForm!: UntypedFormGroup;

  public minDateToday: string;
  public minDateNaissance: string;
  public maxDateNaissance: string;

  public loading: boolean;

  @ViewChild("confirmDeleteProcurationModal", { static: false })
  public confirmDeleteProcurationModal!: DsfrModalComponent;

  @ViewChildren("procurationName")
  public firstInputs!: QueryList<ElementRef>;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
    this.minDateToday = getTodayFr();
    this.minDateNaissance = MIN_DATE_NAISSANCE;
    this.maxDateNaissance = getTodayIso();
    this.procurationToDelete = 0;
  }

  public ngOnInit(): void {
    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });
  }

  public get form(): UntypedFormArray {
    return this.procurationsForm.get("procurations") as UntypedFormArray;
  }

  public hideForm(): void {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
    this.form.clear();
  }

  public openForm() {
    this.isFormVisible = true;
    this.initForm();
    this.changeFocus(0);
  }

  public addProcuration(
    procuration: UsagerOptionsProcuration = new UsagerOptionsProcuration()
  ): void {
    this.submitted = false;
    this.form.push(this.newProcuration(procuration));
    this.changeFocus(this.form.length - 1);
  }

  public changeFocus(index: number) {
    this.changeDetectorRef.detectChanges();
    const elementToFocus = this.firstInputs.toArray()[index]?.nativeElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }
  }

  public initForm(): void {
    if (this.usager.options.procurations.length > 0) {
      for (const procuration of this.usager.options.procurations) {
        this.addProcuration(procuration as UsagerOptionsProcuration);
      }
    } else {
      this.addProcuration();
    }
  }

  public newProcuration(procuration: UsagerOptionsProcuration) {
    return new FormGroup(
      {
        nom: new FormControl<string>(procuration.nom, [
          Validators.required,
          NoWhiteSpaceValidator,
        ]),
        prenom: new FormControl<string>(procuration.prenom, [
          Validators.required,
          NoWhiteSpaceValidator,
        ]),
        dateFin: new FormControl<string>(
          procuration.dateFin ? formatDateToFr(procuration.dateFin) : null,
          [Validators.required]
        ),
        dateDebut: new FormControl<string>(
          procuration.dateDebut ? formatDateToFr(procuration.dateDebut) : null,
          [Validators.required]
        ),
        dateNaissance: new FormControl<string>(
          procuration.dateNaissance
            ? formatDateToFr(procuration.dateNaissance)
            : null,
          [Validators.required]
        ),
      },
      {
        validators: endDateAfterBeginDateValidator,
      }
    );
  }

  public editProcurations(): void {
    this.submitted = true;

    if (this.procurationsForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    const procurationFormData: UsagerOptionsProcuration[] = this.form.value.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (procuration: any) => {
        return {
          nom: procuration.nom,
          prenom: procuration.prenom,
          dateFin: parseFrDate(procuration.dateFin),
          dateDebut: parseFrDate(procuration.dateDebut),
          dateNaissance: parseFrDate(procuration.dateNaissance),
        };
      }
    );

    this.loading = true;
    this.subscription.add(
      this.usagerOptionsService
        .editProcurations(procurationFormData, this.usager.ref)
        .subscribe({
          next: () => {
            this.hideForm();
            this.toastService.success("Procuration modifiée avec succès");
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'ajouter la procuration'");
          },
        })
    );
  }

  public openConfirmation(index: number): void {
    this.procurationToDelete = index;
    this.confirmDeleteProcurationModal.open();
  }

  public deleteProcurationForm(i: number): void {
    this.form.removeAt(i);
    if (this.form.length === 0) {
      this.addProcuration();
    } else {
      this.changeFocus(this.form.length - 1);
    }
  }

  public deleteProcuration(procurationToDelete: number): void {
    this.subscription.add(
      this.usagerOptionsService
        .deleteProcuration(this.usager.ref, procurationToDelete)
        .subscribe({
          next: () => {
            this.toastService.success("Procuration supprimée avec succès");
            this.hideForm();
            this.closeModals();
          },
          error: () => {
            this.toastService.error("Impossible de supprimer la procuration");
          },
        })
    );
  }

  public closeModals(): void {
    this.procurationToDelete = 0;
    this.submitted = false;
    this.confirmDeleteProcurationModal.close();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
