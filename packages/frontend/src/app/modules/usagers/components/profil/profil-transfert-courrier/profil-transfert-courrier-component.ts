import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { formatDateToNgb, minDateToday } from "src/app/shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "src/app/shared/validators";
import { AppUser, UserRole } from "../../../../../../_common/model";
import { LoadingService } from "../../../../loading/loading.service";
import { CustomDatepickerI18n } from "../../../../shared/services/date-french";
import { Options } from "../../../interfaces/options";
import { Usager } from "../../../interfaces/usager";
import { UsagerService } from "../../../services/usager.service";

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
  @Input() public usager: Usager;
  @Input() public me: AppUser;

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public isFormVisible: boolean;
  public transfertForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  constructor(
    public loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private usagerService: UsagerService,
    private matomo: MatomoTracker
  ) {
    this.hideForm();
    this.minDateToday = minDateToday;
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
    return this.transfertForm.controls;
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

    this.usagerService.editTransfert(formValue, this.usager.id).subscribe(
      (usager: Usager) => {
        this.hideForm();
        this.matomo.trackEvent("profil", "actions", "edit_transfert", 1);
        this.usager = usager;
        this.notifService.success("Transfert ajouté avec succès");
      },
      () => {
        this.notifService.error("Impossible d'ajouter le transfert'");
      }
    );
  }

  public deleteTransfert() {
    this.usagerService.deleteTransfert(this.usager.id).subscribe(
      (usager: Usager) => {
        this.hideForm();
        this.matomo.trackEvent("profil", "actions", "delete_transfert", 1);
        this.transfertForm.reset();
        this.usager = usager;
        this.notifService.success("Transfert supprimé avec succès");
      },
      () => {
        this.notifService.error("Impossible de supprimer le transfert");
      }
    );
  }
}
