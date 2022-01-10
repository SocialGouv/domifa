import { CerfaDocType } from "src/_common/model/cerfa";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";

import { fadeInOut } from "src/app/shared/animations";
import { minDateToday } from "src/app/shared/bootstrap-util";
import { UserStructure, UsagerLight } from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  animations: [fadeInOut],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-rdv",
  styleUrls: ["./step-rdv.component.css"],
  templateUrl: "./step-rdv.component.html",
})
export class StepRdvComponent implements OnInit {
  public rdvForm!: FormGroup;

  public usager!: UsagerFormModel;
  public editRdv: boolean;

  public me: UserStructure;
  public agents: UserStructure[] = [];

  /* Config datepickers */
  public dToday = new Date();
  public loading = false;

  public minDateToday: NgbDateStruct;
  public maxDateRdv: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private usagerDossierService: UsagerDossierService,
    private documentService: DocumentService,
    private toastService: CustomToastService,
    private authService: AuthService,
    private nbgDate: NgbDateCustomParserFormatter,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.editRdv = true;

    this.maxDateRdv = {
      day: this.dToday.getDate(),
      month: this.dToday.getMonth() + 1,
      year: this.dToday.getFullYear() + 2,
    };

    this.usager = null;

    this.minDateToday = minDateToday;
  }

  get r(): { [key: string]: AbstractControl } {
    return this.rdvForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Rendez-vous de l'usager");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);

          this.initForm();
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.router.navigate(["404"]);
    }
  }

  public getCerfa(typeCerfa: CerfaDocType = "attestation") {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }

  public initForm() {
    this.rdvForm = this.formBuilder.group({
      heureRdv: [this.usager.rdv.heureRdv, [Validators.required]],
      isNow: [this.usager.rdv.isNow, []],
      jourRdv: [this.usager.rdv.jourRdv, [Validators.required]],
      userId: [this.usager.rdv.userId, Validators.required],
    });

    this.editRdv = this.usager.rdv.dateRdv === null;

    this.usagerDossierService
      .getAllUsersForAgenda()
      .subscribe((users: UserStructure[]) => {
        this.agents = users;

        const userIdRdv =
          this.usager.rdv.userId === null ? this.me.id : this.usager.rdv.userId;

        this.rdvForm.controls.userId.setValue(userIdRdv, {
          onlySelf: true,
        });
      });
  }

  public setValueRdv(value: boolean): void {
    if (value === true) {
      this.rdvForm.controls.isNow.setValue(true);
      this.rdvForm.controls.userId.setValue(this.me.id);
    } else {
      this.rdvForm.controls.isNow.setValue(false);
    }
  }

  public rdvNow(): void {
    const rdvFormValue = {
      isNow: true,
      dateRdv: new Date(),
      userId: this.me.id,
    };
    this.loading = true;
    this.usagerDossierService.setRdv(rdvFormValue, this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.loading = false;
        this.router.navigate(["usager/" + usager.ref + "/edit/entretien"]);
      },
      () => {
        this.loading = false;
        this.toastService.error(
          "Impossible de réaliser l'entretien maintenant"
        );
      }
    );
  }

  public submitRdv(): void {
    if (this.rdvForm.invalid) {
      this.toastService.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    if (this.rdvForm.get("isNow").value === true) {
      this.rdvNow();
      return;
    }
    this.loading = true;

    const heureRdv = this.rdvForm.controls.heureRdv.value;
    const jourRdv = this.nbgDate.formatEn(this.rdvForm.controls.jourRdv.value);
    const dateRdv = new Date(jourRdv);
    dateRdv.setHours(heureRdv.hour, heureRdv.minute, 0);

    const rdvFormValue = {
      isNow: false,
      dateRdv,
      userId: this.rdvForm.controls.userId.value,
    };

    this.usagerDossierService.setRdv(rdvFormValue, this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.loading = false;
        this.toastService.success("Rendez-vous enregistré");
        this.usager = new UsagerFormModel(usager);
        this.editRdv = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error("Impossible d'enregistrer le rendez-vous");
      },
    });
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
