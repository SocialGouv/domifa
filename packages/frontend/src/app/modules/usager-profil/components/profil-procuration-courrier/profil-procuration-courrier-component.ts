import { UsagerProcuration } from "./../../../usager-shared/interfaces/usager-procuration";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import {
  UserStructure,
  UsagerLight,
  UserStructureRole,
} from "../../../../../_common/model";
import {
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "../../../../shared/validators";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../services/usager-profil.service";
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

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public submitted: boolean;
  public isFormVisible: boolean;

  public procurationsForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private toastService: CustomToastService,
    private usagerProfilService: UsagerProfilService,
    private matomo: MatomoTracker
  ) {
    this.isFormVisible = false;
    this.submitted = false;
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
  }

  public ngOnInit(): void {
    this.initForm();

    console.log(new UsagerProcuration());
  }

  public showForm(): void {
    this.isFormVisible = true;
  }

  public initForm(): void {
    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });

    this.addProcuration();

    console.log(this.procurationsForm);
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

  public newProcuration(procuration: UsagerProcuration) {
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
            this.usager.options.procuration.dateNaissance
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

  public editProcuration(): void {
    const procurationsData: UsagerProcuration[] =
      this.procurationsForm.value.procurations.map(
        (procu: UsagerProcuration) => {
          return {
            nom: procu.nom,
            prenom: procu.prenom,
            dateFin: this.nbgDate.formatEn(
              this.procurationsForm.controls.dateFin.value
            ),
            dateDebut: this.nbgDate.formatEn(
              this.procurationsForm.controls.dateDebut.value
            ),
            dateNaissance: this.nbgDate.formatEn(
              this.procurationsForm.controls.dateNaissance.value
            ),
          };
        }
      );

    this.usagerProfilService
      .editProcurations(procurationsData, this.usager.ref)
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

  public deleteProcuration(procurationIndex: number): void {
    if (!this.usager.options.procuration.actif) {
      this.hideForm();
      return;
    }

    // TODO: Ajouter l'index du tableau à supprimer
    this.usagerProfilService
      .deleteProcuration(this.usager.ref, procurationIndex)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.hideForm();
          this.usagerChanges.emit(usager);
          this.procurationsForm.reset();
          this.usager = new UsagerFormModel(usager);
          this.toastService.success("Procuration supprimée avec succès");
          this.matomo.trackEvent("profil", "actions", "delete-procuration", 1);
        },
        error: () => {
          this.toastService.error("Impossible de supprimer la procuration");
        },
      });
  }
}
