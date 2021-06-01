import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { formatDateToNgb, minDateToday } from "src/app/shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "src/app/shared/validators";
import { AppUser, UsagerLight, UserRole } from "../../../../../_common/model";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerService } from "../../../usagers/services/usager.service";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
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
  @Input() public me: AppUser;

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
    private notifService: ToastrService,
    private usagerProfilService: UsagerProfilService,
    private matomo: MatomoTracker
  ) {
    this.isFormVisible = false;
    this.minDateToday = minDateToday;
  }

  public ngOnInit() {
    this.initForm();
  }

  public showForm() {
    this.isFormVisible = true;
    this.initForm();
    this.transfertForm.reset(this.transfertForm.value);
  }

  public hideForm() {
    this.isFormVisible = false;
    this.transfertForm.reset(this.transfertForm.value);
  }

  get f() {
    return this.transfertForm.controls;
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public initForm() {
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

  public editTransfert() {
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

          this.notifService.success("Transfert ajouté avec succès");
        },
        () => {
          this.notifService.error("Impossible d'ajouter le transfert'");
        }
      );
  }

  public deleteTransfert() {
    this.usagerProfilService.deleteTransfert(this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.usagerChanges.emit(usager);
        this.hideForm();
        this.matomo.trackEvent("profil", "actions", "delete_transfert", 1);
        this.transfertForm.reset();
        this.usager = new UsagerFormModel(usager);
        this.notifService.success("Transfert supprimé avec succès");
      },
      () => {
        this.notifService.error("Impossible de supprimer le transfert");
      }
    );
  }
}
