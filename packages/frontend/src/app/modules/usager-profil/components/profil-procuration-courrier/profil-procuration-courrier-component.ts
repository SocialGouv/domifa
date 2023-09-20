import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
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
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "@ngx-matomo/tracker";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter.service";
import {
  UserStructure,
  DEFAULT_MODAL_OPTIONS,
} from "../../../../../_common/model";
import {
  endDateAfterBeginDateValidator,
  NoWhiteSpaceValidator,
} from "../../../../shared";
import {
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";

import { CustomDatepickerI18n } from "../../../shared/services/date-french.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProcuration } from "../../../usager-shared/interfaces/UsagerProcuration.interface";
import { UsagerOptionsService } from "../../services/usager-options.service";
import { UsagerOptionsProcuration } from "@domifa/common";
@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil-procuration-courrier",
  templateUrl: "./profil-procuration-courrier.html",
})
export class UsagersProfilProcurationCourrierComponent
  implements OnInit, OnDestroy
{
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  private readonly subscription = new Subscription();

  public isFormVisible: boolean;
  public submitted: boolean;
  public procurationToDelete: number;

  public procurationsForm!: UntypedFormGroup;

  public minDateToday: NgbDateStruct;
  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  public loading: boolean;

  @ViewChild("confirmDeleteModal", { static: true })
  public confirmDeleteModal!: TemplateRef<NgbModalRef>;

  @ViewChildren("procurationName")
  public firstInputs!: QueryList<ElementRef>;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly toastService: CustomToastService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly matomo: MatomoTracker,
    private readonly modalService: NgbModal,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = minDateToday;
    this.procurationToDelete = 0;
  }

  public ngOnInit(): void {
    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });
    this.initForm();
  }

  public get form(): UntypedFormArray {
    return this.procurationsForm.get("procurations") as UntypedFormArray;
  }

  public hideForm(): void {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
    this.procurationsForm.reset();
  }

  public openForm() {
    this.isFormVisible = true;
    this.changeFocus(0);
  }

  public addProcuration(
    procuration: UsagerProcuration = new UsagerProcuration()
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
        this.addProcuration(procuration);
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
        dateFin: new FormControl<NgbDateStruct>(
          procuration.dateFin ? formatDateToNgb(procuration.dateFin) : null,
          [Validators.required]
        ),
        dateDebut: new FormControl<NgbDateStruct>(
          procuration.dateDebut ? formatDateToNgb(procuration.dateDebut) : null,
          [Validators.required]
        ),
        dateNaissance: new FormControl<NgbDateStruct>(
          procuration.dateNaissance
            ? formatDateToNgb(procuration.dateNaissance)
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
          dateFin: this.nbgDate.formatEn(procuration.dateFin),
          dateDebut: this.nbgDate.formatEn(procuration.dateDebut),
          dateNaissance: this.nbgDate.formatEn(procuration.dateNaissance),
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
            this.matomo.trackEvent("profil", "actions", "edit_procuration", 1);
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
    this.modalService.open(this.confirmDeleteModal, DEFAULT_MODAL_OPTIONS);
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

            this.matomo.trackEvent(
              "profil",
              "actions",
              "delete-procuration",
              1
            );
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
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
