import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  UserStructure,
  UsagerLight,
  UserStructureRole,
} from "../../../../../_common/model";
import {
  minDateToday,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "../../../../shared/validators";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil-transfert-courrier",
  styleUrls: ["./profil-transfert-courrier.css"],
  templateUrl: "./profil-transfert-courrier.html",
})
export class UsagersProfilTransfertCourrierComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  @Output() usagerChanges = new EventEmitter<UsagerLight>();

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public isFormVisible: boolean;

  public transfertForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private toastService: CustomToastService,
    private usagerProfilService: UsagerProfilService,
    private matomo: MatomoTracker
  ) {
    this.isFormVisible = false;
    this.minDateToday = minDateToday;
    this.usager = null;
    this.me = null;
  }

  public ngOnInit(): void {
    this.initForm();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.transfertForm.controls;
  }

  public showForm(): void {
    this.isFormVisible = true;
    this.initForm();
    this.transfertForm.reset(this.transfertForm.value);
  }

  public hideForm(): void {
    this.isFormVisible = false;
    this.transfertForm.reset(this.transfertForm.value);
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me.role === role;
  }

  public initForm(): void {
    this.transfertForm = this.formBuilder.group(
      {
        nom: [this.usager.options.transfert.nom, [Validators.required]],
        adresse: [
          this.usager.options.transfert.adresse,
          [Validators.required, Validators.minLength(10)],
        ],
        dateFin: [
          formatDateToNgb(this.usager.options.transfert.dateFin),
          [Validators.required],
        ],
        dateDebut: [
          formatDateToNgb(this.usager.options.transfert.dateDebut),
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

  public editTransfert(): void {
    const formValue = {
      ...this.transfertForm.value,
      dateFin: this.nbgDate.formatEn(this.transfertForm.controls.dateFin.value),
      dateDebut: this.nbgDate.formatEn(
        this.transfertForm.controls.dateDebut.value
      ),
    };

    this.usagerProfilService
      .editTransfert(formValue, this.usager.ref)
      .subscribe(
        (usager: UsagerLight) => {
          this.usagerChanges.emit(usager);
          this.hideForm();
          this.matomo.trackEvent("profil", "actions", "edit_transfert", 1);
          this.usager = new UsagerFormModel(usager);

          this.toastService.success("Transfert ajouté avec succès");
        },
        () => {
          this.toastService.error("Impossible d'ajouter le transfert'");
        }
      );
  }

  public deleteTransfert(): void {
    if (!this.usager.options.transfert.actif) {
      this.hideForm();
      return;
    }

    this.usagerProfilService.deleteTransfert(this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.usagerChanges.emit(usager);
        this.hideForm();
        this.matomo.trackEvent("profil", "actions", "delete_transfert", 1);
        this.transfertForm.reset();
        this.usager = new UsagerFormModel(usager);
        this.toastService.success("Transfert supprimé avec succès");
      },
      () => {
        this.toastService.error("Impossible de supprimer le transfert");
      }
    );
  }
}
