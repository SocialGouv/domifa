import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { of, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { regexp } from "src/app/shared/constants/REGEXP.const";
import {
  FormEmailTakenValidator,
  Structure,
  StructureCommon,
} from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";
import { StructureCommonWeb } from "../../services/StructureCommonWeb.type";
import { structureNameChecker } from "../structure-edit-form/structureNameChecker.service";
import {
  anyPhoneValidator,
  DEPARTEMENTS_LISTE,
  getFormPhone,
} from "../../../../shared";
import { PREFERRED_COUNTRIES } from "../../../../shared/constants";

@Component({
  selector: "app-structures-form",
  styleUrls: ["./structures-form.component.css"],
  templateUrl: "./structures-form.component.html",
})
export class StructuresFormComponent implements OnInit, OnDestroy {
  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;
  public success = false;

  public loading = false;
  public structureForm!: FormGroup;
  public structure: StructureCommon;
  public DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public submitted = false;

  public etapeInscription: number;
  public etapes = [
    "Enregistrement de la structure",
    "Création du compte personnel",
  ];

  public structureRegisterInfos: {
    etapeInscription: number;
    structure: StructureCommon;
  };

  private unsubscribe: Subject<void> = new Subject();
  public accountExist: boolean;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.etapeInscription = 0;

    this.structure = new StructureCommonWeb();

    this.structureRegisterInfos = {
      etapeInscription: 0,
      structure: this.structure,
    };

    this.accountExist = false;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.structureForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscrivez votre structure sur DomiFa");

    this.structureForm = this.formBuilder.group({
      adresse: [this.structure.adresse, [Validators.required]],
      adresseCourrier: this.formBuilder.group({
        actif: [this.structure.adresseCourrier.actif, []],
        adresse: [this.structure.adresseCourrier.adresse, []],
        ville: [this.structure.adresseCourrier.ville, []],
        codePostal: [this.structure.adresseCourrier.codePostal, []],
      }),
      agrement: [this.structure.agrement, []],
      capacite: [this.structure.capacite, []],
      codePostal: [
        this.structure.codePostal,
        [
          Validators.required,
          Validators.maxLength(5),
          this.structureService.codePostalValidator(),
        ],
      ],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, []],
      email: [
        this.structure.email,
        [Validators.required, Validators.pattern(regexp.email)],
        this.validateEmailNotTaken.bind(this),
      ],
      id: [this.structure.id, [Validators.required]],
      nom: [this.structure.nom, [Validators.required]],
      telephone: new FormControl(undefined, [
        Validators.required,
        anyPhoneValidator,
      ]),
      responsable: this.formBuilder.group({
        fonction: [this.structure.responsable.fonction, [Validators.required]],
        nom: [this.structure.responsable.nom, [Validators.required]],
        prenom: [this.structure.responsable.prenom, [Validators.required]],
      }),
      structureType: [this.structure.structureType, [Validators.required]],
      ville: [this.structure.ville, [Validators.required]],
    });

    this.structureForm.get("structureType").valueChanges.subscribe((value) => {
      this.structureForm.get("agrement").setValidators(null);
      this.structureForm.get("departement").setValidators(null);

      if (value === "asso") {
        this.structureForm.get("agrement").setValidators(Validators.required);
        this.structureForm
          .get("departement")
          .setValidators(Validators.required);
      }

      this.structureForm.get("agrement").updateValueAndValidity();
      this.structureForm.get("departement").updateValueAndValidity();
    });

    this.structureForm
      .get("adresseCourrier")
      .get("actif")
      .valueChanges.subscribe((value) => {
        const isRequired = value === true ? [Validators.required] : null;

        this.structureForm
          .get("adresseCourrier")
          .get("adresse")
          .setValidators(isRequired);
        this.structureForm
          .get("adresseCourrier")
          .get("codePostal")
          .setValidators(isRequired);
        this.structureForm
          .get("adresseCourrier")
          .get("ville")
          .setValidators(isRequired);

        this.structureForm
          .get("adresseCourrier")
          .get("adresse")
          .updateValueAndValidity();
        this.structureForm
          .get("adresseCourrier")
          .get("codePostal")
          .updateValueAndValidity();
        this.structureForm
          .get("adresseCourrier")
          .get("ville")
          .updateValueAndValidity();
      });
  }

  public submitStrucutre(): void {
    this.submitted = true;

    if (this.structureForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    const structureFormValue: Partial<Structure> = {
      ...this.structureForm.value,
    };

    structureFormValue.telephone = getFormPhone(
      this.structureForm.value.telephone
    );

    this.structureService.prePost(structureFormValue).subscribe({
      next: (structure: StructureCommon) => {
        this.etapeInscription = 1;
        this.structureRegisterInfos.etapeInscription = 1;
        this.structureRegisterInfos.structure = structure;
      },
      error: () => {
        this.toastService.error("Veuillez vérifier les champs du formulaire");
      },
    });
  }

  public validateEmailNotTaken(
    control: AbstractControl
  ): FormEmailTakenValidator {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.structureService.validateEmail(control.value).pipe(
          takeUntil(this.unsubscribe),
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public isInvalidStructureName(structureName: string): boolean {
    return structureNameChecker.isInvalidStructureName(structureName);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
