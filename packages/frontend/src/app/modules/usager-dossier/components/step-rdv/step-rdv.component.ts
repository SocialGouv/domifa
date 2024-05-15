import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

import { UsagerLight, RdvForm } from "../../../../../_common/model";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import {
  addMinutes,
  differenceInCalendarDays,
  format,
  setHours,
  setMinutes,
} from "date-fns";
import {
  fadeInOut,
  minDateToday,
  NoWhiteSpaceValidator,
  selectUsagerByRef,
} from "../../../../shared";

import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { BaseUsagerDossierPageComponent } from "../base-usager-dossier-page/base-usager-dossier-page.component";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import {
  NgbDateCustomParserFormatter,
  AuthService,
  CustomToastService,
} from "../../../shared/services";
import { UserStructure, CerfaDocType, Usager } from "@domifa/common";

@Component({
  animations: [fadeInOut],

  selector: "app-rdv",
  styleUrls: ["./step-rdv.component.css"],
  templateUrl: "./step-rdv.component.html",
})
export class StepRdvComponent
  extends BaseUsagerDossierPageComponent
  implements OnInit, OnDestroy
{
  public rdvForm!: UntypedFormGroup;
  public editRdv: boolean;
  public agents: UserStructure[] = [];
  public rdvIsToday: boolean;
  public dToday = new Date();
  public minDateToday: NgbDateStruct;
  public maxDateRdv: NgbDateStruct;

  constructor(
    public authService: AuthService,
    public usagerDossierService: UsagerDossierService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly documentService: DocumentService,
    private readonly nbgDate: NgbDateCustomParserFormatter
  ) {
    super(
      authService,
      usagerDossierService,
      titleService,
      toastService,
      route,
      router,
      store
    );
    this.submitted = false;
    this.loading = false;
    this.editRdv = false;
    this.rdvIsToday = false;
    this.maxDateRdv = {
      day: this.dToday.getDate(),
      month: this.dToday.getMonth() + 1,
      year: this.dToday.getFullYear() + 2,
    };
    this.minDateToday = minDateToday;
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.params.id;

    this.subscription.add(
      this.store
        .select(selectUsagerByRef(id))
        .subscribe((usager: UsagerLight) => {
          if (usager) {
            this.usager = new UsagerFormModel(usager);
            this.initForm();
          }
        })
    );

    this.subscription.add(
      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: Usager) => {
          this.usager = new UsagerFormModel(usager);
        },
        error: () => {
          this.toastService.error("Le dossier recherché n'existe pas");
          this.router.navigate(["404"]);
        },
      })
    );
  }

  public get r(): { [key: string]: AbstractControl } {
    return this.rdvForm.controls;
  }

  public getCerfa(typeCerfa: CerfaDocType = "attestation"): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }

  public initForm(): void {
    this.rdvForm = this.formBuilder.group({
      heureRdv: [
        this.usager.rdv.heureRdv,
        [Validators.required, this.isHourOk()],
      ],
      isNow: [this.usager.rdv.isNow, []],
      jourRdv: [this.usager.rdv.jourRdv, [Validators.required]],
      userId: [
        this.usager.rdv.userId,
        [Validators.required, NoWhiteSpaceValidator],
      ],
    });

    this.subscription.add(
      this.rdvForm.controls.jourRdv.valueChanges.subscribe(
        (value: NgbDateStruct) => {
          let isValueToday = false;
          if (!this.r.jourRdv.invalid) {
            const jourRdv = new Date(this.nbgDate.formatEn(value));

            if (differenceInCalendarDays(jourRdv, new Date()) === 0) {
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
      )
    );

    this.rdvForm.controls.jourRdv.setValue(this.usager.rdv.jourRdv);

    this.editRdv = this.usager.rdv.userId === null;
    this.subscription.add(
      this.usagerDossierService
        .getAllUsersForAgenda()
        .subscribe((users: UserStructure[]) => {
          this.agents = users;

          const userIdRdv = this.usager.rdv?.userId || this.me?.id;

          this.rdvForm.controls.userId.setValue(userIdRdv, {
            onlySelf: true,
          });
        })
    );
  }

  public setValueRdv(value: boolean): void {
    if (value === true) {
      this.rdvForm.controls.isNow.setValue(true);
      this.rdvForm.controls.userId.setValue(this.me?.id);
    } else {
      this.rdvForm.controls.isNow.setValue(false);
    }
  }

  public rdvNow(): void {
    this.loading = true;

    const rdvFormValue: RdvForm = {
      isNow: true,
      userId: this.me?.id ?? 0,
    };

    this.subscription.add(
      this.usagerDossierService
        .setRdv(rdvFormValue, this.usager.ref)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.scrollTop();
            this.loading = false;
            this.router.navigate(["usager/" + usager.ref + "/edit/entretien"]);
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Impossible de réaliser l'entretien maintenant"
            );
          },
        })
    );
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
    this.subscription.add(
      this.usagerDossierService
        .setRdv(rdvFormValue, this.usager.ref)
        .subscribe({
          next: () => {
            this.loading = false;
            this.editRdv = false;
            this.scrollTop();
            this.toastService.success("Rendez-vous enregistré");
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'enregistrer le rendez-vous");
          },
        })
    );
  }

  private scrollTop(): void {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
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
