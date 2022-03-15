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
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "../../../../shared/validators";
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
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  @Output() usagerChanges = new EventEmitter<UsagerLight>();

  @ViewChildren("procurationNom") inputsProcurations: QueryList<ElementRef>;

  public isFormVisible: boolean;
  public submitted: boolean;
  public procurationToDelete: number; // Index de la procu à supprimer

  public procurationsForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  @ViewChild("confirmDelete", { static: true })
  public confirmDelete!: TemplateRef<NgbModalRef>;

  constructor(
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private toastService: CustomToastService,
    private usagerOptionsService: UsagerOptionsService,
    private matomo: MatomoTracker,
    private readonly modalService: NgbModal
  ) {
    this.hideForm();
    this.submitted = false;
    this.isFormVisible = false;
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
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
    this.isFormVisible = false;
  }

  public addProcuration(
    procuration: UsagerProcuration = new UsagerProcuration()
  ): void {
    (this.procurationsForm.controls.procurations as FormArray).push(
      this.newProcuration(procuration)
    );
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
    return this.formBuilder.group(
      {
        nom: [procuration.nom, [Validators.required]],
        prenom: [procuration.prenom, [Validators.required]],
        dateFin: [formatDateToNgb(procuration.dateFin), [Validators.required]],
        dateDebut: [
          formatDateToNgb(procuration.dateDebut),
          [Validators.required],
        ],
        dateNaissance: [
          formatDateToNgb(
            procuration.dateNaissance
              ? new Date(procuration.dateNaissance)
              : undefined
          ),
          [Validators.required],
        ],
      },
      {
        validator: endDateAfterBeginDateValidator({
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
    this.modalService.dismissAll();
  }
}
