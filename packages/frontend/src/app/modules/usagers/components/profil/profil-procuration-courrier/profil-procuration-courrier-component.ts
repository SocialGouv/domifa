import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import {
  formatDateToNgb,
  minDateNaissance,
  minDateToday,
} from "src/app/shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "src/app/shared/validators";
import {
  AppUser,
  UsagerLight,
  UserRole,
} from "../../../../../../_common/model";

import { CustomDatepickerI18n } from "../../../../shared/services/date-french";
import { UsagerService } from "../../../services/usager.service";
import { UsagerFormModel } from "../../form/UsagerFormModel";

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
  @Input() public me: AppUser;

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public isFormVisible: boolean;

  public procurationForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private usagerService: UsagerService,
    private matomo: MatomoTracker
  ) {
    this.hideForm();

    this.isFormVisible = false;
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public ngOnInit() {
    this.initForm();
  }

  public showForm() {
    this.isFormVisible = true;
    this.initForm();
  }

  public hideForm() {
    this.isFormVisible = false;
  }

  get f() {
    return this.procurationForm.controls;
  }

  public initForm() {
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

  public editProcuration() {
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

    this.usagerService.editProcuration(formValue, this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.hideForm();
        this.usager = new UsagerFormModel(usager);
        this.notifService.success("Procuration ajoutée avec succès");
        this.matomo.trackEvent("profil", "actions", "edit_procuration", 1);
      },
      (error) => {
        this.notifService.error("Impossible d'ajouter la procuration'");
      }
    );
  }

  public deleteProcuration() {
    this.usagerService.deleteProcuration(this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.hideForm();
        this.procurationForm.reset();
        this.usager = new UsagerFormModel(usager);
        this.notifService.success("Procuration supprimée avec succès");
        this.matomo.trackEvent("profil", "actions", "delete-procuration", 1);
      },
      () => {
        this.notifService.error("Impossible de supprimer la procuration");
      }
    );
  }
}
