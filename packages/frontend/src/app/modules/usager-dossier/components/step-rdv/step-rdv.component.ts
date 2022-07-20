import { RdvForm } from "./../../../../../_common/model/usager/rdv/RdvForm.type";
import { CerfaDocType } from "src/_common/model/cerfa";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
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
import {
  addMinutes,
  differenceInDays,
  format,
  setHours,
  setMinutes,
} from "date-fns";
import { getUsagerNomComplet } from "../../../../shared";

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

  public me!: UserStructure;
  public agents: UserStructure[] = [];

  public rdvIsToday: boolean;

  /* Config datepickers */
  public dToday = new Date();
  public loading = false;
  public submitted = false;

  public minDateToday: NgbDateStruct;
  public maxDateRdv: NgbDateStruct;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usagerDossierService: UsagerDossierService,
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute
  ) {
    this.editRdv = true;
    this.rdvIsToday = false;
    this.submitted = false;
    this.maxDateRdv = {
      day: this.dToday.getDate(),
      month: this.dToday.getMonth() + 1,
      year: this.dToday.getFullYear() + 2,
    };

    this.minDateToday = minDateToday;
  }

  get r(): { [key: string]: AbstractControl } {
    return this.rdvForm.controls;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: UsagerLight) => {
          this.titleService.setTitle(
            "Rendez-vous de " + getUsagerNomComplet(usager)
          );
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
      heureRdv: [
        this.usager.rdv.heureRdv,
        [Validators.required, this.isHourOk()],
      ],
      isNow: [this.usager.rdv.isNow, []],
      jourRdv: [this.usager.rdv.jourRdv, [Validators.required]],
      userId: [this.usager.rdv.userId, Validators.required],
    });

    this.rdvForm.controls.jourRdv.valueChanges.subscribe(
      (value: NgbDateStruct) => {
        let isValueToday = false;

        if (!this.r.jourRdv.invalid) {
          const jourRdv = new Date(this.nbgDate.formatEn(value));

          if (differenceInDays(jourRdv, new Date()) === 0) {
            isValueToday = true;

            this.rdvForm.controls.heureRdv.setValue(
              format(addMinutes(new Date(), 1), "HH:mm"),
              {
                onlySelf: true,
              }
            );
          }
        }
        this.rdvIsToday = isValueToday;
        this.rdvForm.controls.heureRdv.updateValueAndValidity();
      }
    );

    this.rdvForm.controls.jourRdv.setValue(this.usager.rdv.jourRdv);

    this.editRdv = this.usager.rdv.userId === null;

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
    this.loading = true;

    const rdvFormValue: RdvForm = {
      isNow: true,
      userId: this.me.id,
    };

    this.usagerDossierService.setRdv(rdvFormValue, this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.loading = false;
        this.router.navigate(["usager/" + usager.ref + "/edit/entretien"]);
      },
      error: () => {
        this.loading = false;
        this.toastService.error(
          "Impossible de réaliser l'entretien maintenant"
        );
      },
    });
  }

  public submitRdv(): void {
    if (this.rdvForm.invalid) {
      this.toastService.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    if (this.rdvForm.controls.isNow.value === true) {
      this.rdvNow();
      return;
    }

    this.loading = true;

    const heureRdv = this.rdvForm.controls.heureRdv.value.split(":");
    const jourRdv = this.nbgDate.formatEn(this.rdvForm.controls.jourRdv.value);

    const dateRdv: Date = setMinutes(
      setHours(new Date(jourRdv), heureRdv[0]),
      heureRdv[1]
    );

    const rdvFormValue: RdvForm = {
      isNow: false,
      dateRdv,
      userId: this.rdvForm.controls.userId.value,
    };

    this.usagerDossierService.setRdv(rdvFormValue, this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.loading = false;
        this.editRdv = false;
        this.toastService.success("Rendez-vous enregistré");
        this.usager = new UsagerFormModel(usager);
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

  private isHourOk(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.rdvIsToday) {
        return null;
      }

      const heureRdv = control.value.split(":");

      const dateRdv: Date = setMinutes(
        setHours(new Date(), heureRdv[0]),
        heureRdv[1]
      );

      return dateRdv < new Date() ? { dateInvalid: true } : null;
    };
  }
}
