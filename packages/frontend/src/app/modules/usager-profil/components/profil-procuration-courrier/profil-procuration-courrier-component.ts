import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
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
} from "../../../../../_common/model";
import {
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "../../../../shared/validators";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
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

  public isFormVisible: boolean;
  public submitted: boolean;
  public procurationToDelete: number; // Index de la procu à supprimer

  public procurationForm!: FormGroup;
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
    this.initForm();
  }

  public showForm(): void {
    this.isFormVisible = true;
    this.initForm();
  }

  public hideForm(): void {
    this.isFormVisible = false;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.procurationForm.controls;
  }

  public initForm(): void {
    this.procurationForm = this.formBuilder.group(
      {
        nom: [this.usager.options.procuration.nom, [Validators.required]],
        prenom: [this.usager.options.procuration.prenom, [Validators.required]],
        dateFin: [
          formatDateToNgb(this.usager.options.procuration.dateFin),
          [Validators.required],
        ],
        dateDebut: [
          formatDateToNgb(this.usager.options.procuration.dateDebut),
          [Validators.required],
        ],
        dateNaissance: [
          formatDateToNgb(
            this.usager.options.procuration.dateNaissance
              ? new Date(this.usager.options.procuration.dateNaissance)
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
    this.submitted = true;
    if (this.procurationForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    const formValue = {
      ...this.procurationForm.value,
      dateFin: this.nbgDate.formatEn(
        this.procurationForm.controls.dateFin.value
      ),
      dateDebut: this.nbgDate.formatEn(
        this.procurationForm.controls.dateDebut.value
      ),
      dateNaissance: this.nbgDate.formatEn(
        this.procurationForm.controls.dateNaissance.value
      ),
    };

    this.usagerOptionsService
      .editProcuration(formValue, this.usager.ref)
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

  public openConfirmation(): void {
    this.modalService.open(this.confirmDelete);
  }

  public deleteProcuration(): void {
    if (!this.usager.options.procuration.actif) {
      this.hideForm();
      return;
    }

    // TODO: intégrer l'index
    // procurationToDelete
    this.usagerOptionsService.deleteProcuration(this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.toastService.success("Procuration supprimée avec succès");

        setTimeout(() => {
          this.closeModals();
          this.hideForm();
          this.usagerChanges.emit(usager);
          this.procurationForm.reset();
          this.usager = new UsagerFormModel(usager);
          this.matomo.trackEvent("profil", "actions", "delete-procuration", 1);
        }, 500);
      },
      error: () => {
        this.toastService.error("Impossible de supprimer la procuration");
      },
    });
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
