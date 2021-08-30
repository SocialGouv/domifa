import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import {
  formatDateToNgb,
  minDateNaissance,
  minDateToday,
} from "src/app/shared/bootstrap-util";
import { AppUser, Usager, UsagerLight } from "../../../../../_common/model";
import { LIEN_PARENTE_LABELS } from "../../../../../_common/model/usager/constants/LIEN_PARENTE_LABELS.const";
import { languagesAutocomplete } from "../../../../shared";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/validators";
import { AyantDroit } from "../../interfaces/ayant-droit";

import { UsagerFormModel } from "./UsagerFormModel";

@Component({
  animations: [fadeInOut],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-usagers-form",
  styleUrls: ["./usagers-form.css"],
  templateUrl: "./usagers-form.html",
})
export class UsagersFormComponent implements OnInit {
  public doublons: UsagerLight[];
  public LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  /* Config datepickers */
  public dToday = new Date();
  public maxDateNaissance: NgbDateStruct;
  public minDateNaissance: NgbDateStruct;
  public minDateToday: NgbDateStruct;

  public maxDateRdv = {
    day: this.dToday.getDate(),
    month: this.dToday.getMonth() + 1,
    year: this.dToday.getFullYear() + 2,
  };

  public usager!: UsagerFormModel;

  public registerForm!: FormGroup;
  public usagerForm!: FormGroup;

  public submitted = false;

  public languagesAutocomplete = languagesAutocomplete;

  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  public me: AppUser;

  get f() {
    return this.usagerForm.controls;
  }

  get ayantsDroits() {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notifService: ToastrService,
    private nbgDate: NgbDateCustomParserFormatter,
    private titleService: Title
  ) {
    this.doublons = [];

    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
  }

  public ngOnInit() {
    this.titleService.setTitle("État-civil du demandeur");

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = new UsagerFormModel(usager);
          this.initForm();
        },
        () => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.usager = new UsagerFormModel();
      this.initForm();
    }
  }

  public initForm() {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      langue: [this.usager.langue, languagesAutocomplete.validator("langue")],
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      dateNaissance: [
        formatDateToNgb(this.usager.dateNaissance),
        [Validators.required],
      ],
      decision: [this.usager.decision, []],
      customRef: [this.usager.customRef, []],
      email: [this.usager.email, [Validators.email]],
      etapeDemande: [this.usager.etapeDemande, []],
      ref: [this.usager.ref, []],
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      preference: this.formBuilder.group({
        phone: [this.usager.preference.phone, [Validators.required]],
        phoneNumber: [this.usager.preference.phoneNumber, []],
      }),
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, []],
      typeDom: [this.usager.typeDom],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]],
    });

    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }

    this.usagerForm
      .get("preference")
      .get("phone")
      .valueChanges.subscribe((value: boolean) => {
        const isRequired =
          value === true
            ? [Validators.required, Validators.pattern(regexp.mobilePhone)]
            : null;

        this.usagerForm
          .get("preference")
          .get("phoneNumber")
          .setValidators(isRequired);

        this.usagerForm
          .get("preference")
          .get("phoneNumber")
          .updateValueAndValidity();
      });
  }

  public isDoublon() {
    if (
      this.usagerForm.controls.nom.value !== "" &&
      this.usagerForm.controls.prenom.value !== "" &&
      this.usagerForm.controls.nom.value !== null &&
      this.usagerForm.controls.nom.value &&
      this.usagerForm.controls.prenom.value !== null &&
      this.usagerForm.controls.prenom.value
    ) {
      this.usagerService
        .isDoublon(
          this.usagerForm.controls.nom.value,
          this.usagerForm.controls.prenom.value,
          this.usager.ref
        )
        .subscribe((usagersDoublon: UsagerLight[]) => {
          this.doublons = [];
          if (usagersDoublon.length !== 0) {
            this.notifService.warning("Un homonyme potentiel a été détecté !");
            usagersDoublon.forEach((doublon: UsagerLight) => {
              this.doublons.push(doublon);
            });
          }
        });
    }
    return false;
  }

  public addAyantDroit(ayantDroit: AyantDroit = new AyantDroit()): void {
    (this.usagerForm.controls.ayantsDroits as FormArray).push(
      this.newAyantDroit(ayantDroit)
    );
  }

  public deleteAyantDroit(i: number): void {
    if (i === 0) {
      this.usagerForm.controls.ayantsDroitsExist.setValue(false);
    }

    (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(i);
  }

  public resetAyantDroit(): void {
    while ((this.usagerForm.controls.ayantsDroits as FormArray).length !== 0) {
      (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(0);
    }
  }

  public newAyantDroit(ayantDroit: AyantDroit) {
    return this.formBuilder.group({
      dateNaissance: [
        formatDateToNgb(ayantDroit.dateNaissance),
        [Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.ref);
  }

  public submitInfos() {
    this.submitted = true;

    if (this.usagerForm.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      const usagerFormValues = this.usagerForm.value;
      usagerFormValues.ayantsDroits.map((ayantDroit: any) => {
        ayantDroit.dateNaissance = new Date(
          this.nbgDate.formatEn(ayantDroit.dateNaissance)
        );
      });

      const formValue: UsagerFormModel = {
        ...usagerFormValues,
        dateNaissance: this.nbgDate.formatEn(
          this.usagerForm.controls.dateNaissance.value
        ),
        etapeDemande: this.usager.etapeDemande,
      };

      if (!formValue.preference.phone) {
        formValue.preference.phoneNumber = null;
      }

      this.usagerService.create(formValue).subscribe(
        (usager: UsagerLight) => {
          this.notifService.success("Enregistrement réussi");
          this.router.navigate(["usager/" + usager.ref + "/edit/rendez-vous"]);
        },
        (error) => {
          if (error.statusCode && error.statusCode === 400) {
            this.notifService.error(
              "Veuillez vérifiez les champs du formulaire"
            );
          } else {
            this.notifService.error("Une erreur innatendue est survenue");
          }
        }
      );
    }
  }
}
