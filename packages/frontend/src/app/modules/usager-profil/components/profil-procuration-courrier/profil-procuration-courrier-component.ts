import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import {
  UserStructure,
  UsagerLight,
  UserStructureRole,
  UsagerOptionsProcuration,
} from "../../../../../_common/model";
import {
  endDateAfterBeginDateValidator,
  noWhiteSpace,
} from "../../../../shared";
import {
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";

import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProcuration } from "../../../usager-shared/interfaces/UsagerProcuration.interface";
import { UsagerOptionsService } from "../../services/usager-options.service";
@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil-procuration-courrier",
  styleUrls: ["./profil-procuration-courrier.css"],
  templateUrl: "./profil-procuration-courrier.html",
})
export class UsagersProfilProcurationCourrierComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  @Output() usagerChanges = new EventEmitter<UsagerLight>();

  @ViewChildren("procurationNom") inputsProcurations!: QueryList<ElementRef>;

  public isFormVisible: boolean;
  public submitted: boolean;
  public procurationToDelete: number | null; // Index de la procu à supprimer

  public procurationsForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  public loading = false;

  @ViewChild("confirmDelete", { static: true })
  public confirmDelete!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly toastService: CustomToastService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly matomo: MatomoTracker,
    private readonly modalService: NgbModal
  ) {
    this.hideForm();
    this.submitted = false;
    this.isFormVisible = false;
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.procurationToDelete = null;
    this.maxDateNaissance = minDateToday;
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me.role === role;
  }

  public ngOnInit(): void {
    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });
  }

  get form(): FormArray {
    return this.procurationsForm.get("procurations") as FormArray;
  }

  public hideForm(): void {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
  }

  public addProcuration(
    procuration: UsagerProcuration = new UsagerProcuration()
  ): void {
    (this.procurationsForm.controls.procurations as FormArray).push(
      this.newProcuration(procuration)
    );
    this.submitted = false;
  }

  public initForm(): void {
    this.isFormVisible = true;

    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });

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
        nom: new FormControl(procuration.nom, [
          Validators.required,
          noWhiteSpace,
        ]),
        prenom: new FormControl(procuration.prenom, [
          Validators.required,
          noWhiteSpace,
        ]),
        dateFin: new FormControl(formatDateToNgb(procuration.dateFin), [
          Validators.required,
        ]),
        dateDebut: new FormControl(formatDateToNgb(procuration.dateDebut), [
          Validators.required,
        ]),
        dateNaissance: new FormControl(
          formatDateToNgb(
            procuration.dateNaissance
              ? new Date(procuration.dateNaissance)
              : null
          ),
          [Validators.required]
        ),
      },
      {
        validators: endDateAfterBeginDateValidator({
          beginDateControlName: "dateDebut",
          endDateControlName: "dateFin",
        }),
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
      (procuration) => {
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
    this.usagerOptionsService
      .editProcurations(procurationFormData, this.usager.ref)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.hideForm();
          this.usagerChanges.emit(usager);
          this.usager = new UsagerFormModel(usager);
          this.toastService.success("Procuration modifiée avec succès");
          this.matomo.trackEvent("profil", "actions", "edit_procuration", 1);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'ajouter la procuration'");
        },
      });
  }

  public openConfirmation(index: number): void {
    this.procurationToDelete = index;
    this.modalService.open(this.confirmDelete);
  }

  public deleteProcurationForm(i: number): void {
    (this.form as FormArray).removeAt(i);

    if (this.form.length === 0) {
      this.procurationsForm.controls.ayantsDroitsExist.setValue(false);
    } else {
      this.focusProcuration();
    }
  }

  private focusProcuration() {
    // Focus sur l'élément créé
    setTimeout(() => {
      const procurationsTable = this.procurationsForm.value;
      const inputs = this.inputsProcurations.toArray();
      inputs[procurationsTable.length - 1].nativeElement.focus();
    }, 500);
  }

  public deleteProcuration(): void {
    this.usagerOptionsService
      .deleteProcuration(this.usager.ref, this.procurationToDelete)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.toastService.success("Procuration supprimée avec succès");

          setTimeout(() => {
            this.closeModals();
            this.hideForm();
            this.usagerChanges.emit(usager);
            this.procurationsForm.reset();
            this.usager = new UsagerFormModel(usager);
            this.matomo.trackEvent(
              "profil",
              "actions",
              "delete-procuration",
              1
            );
          }, 500);
        },
        error: () => {
          this.toastService.error("Impossible de supprimer la procuration");
        },
      });
  }

  public closeModals(): void {
    this.procurationToDelete = null;
    this.submitted = false;
    this.modalService.dismissAll();
  }
}
