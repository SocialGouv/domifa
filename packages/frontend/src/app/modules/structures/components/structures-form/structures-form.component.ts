import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { regexp } from "src/app/shared/validators";
import { StructureCommon } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";
import { StructureCommonWeb } from "../../services/StructureCommonWeb.type";
import { structureNameChecker } from "../structure-edit-form/structureNameChecker.service";
import { DEPARTEMENTS_MAP } from "../../../../shared";

@Component({
  selector: "app-structures-form",
  styleUrls: ["./structures-form.component.css"],
  templateUrl: "./structures-form.component.html",
})
export class StructuresFormComponent implements OnInit {
  public success = false;
  public structureForm!: FormGroup;
  public structure: StructureCommon;
  public departements: {
    [key: string]: {
      departmentName: string;
      regionCode: string;
      regionName: string;
      regionId: string;
    };
  } = DEPARTEMENTS_MAP;
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

  public accountExist: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private toastService: CustomToastService,
    private titleService: Title
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
    this.titleService.setTitle("Inscrivez votre structure sur Domifa");

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
      phone: [
        this.structure.phone,
        [Validators.required, Validators.pattern(regexp.phone)],
      ],
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
    } else {
      this.structureService.prePost(this.structureForm.value).subscribe(
        (structure: StructureCommon) => {
          this.etapeInscription = 1;
          this.structureRegisterInfos.etapeInscription = 1;

          this.structureRegisterInfos.structure = structure;
        },
        () => {
          this.toastService.error("Veuillez vérifier les champs du formulaire");
        }
      );
    }
  }

  public validateEmailNotTaken(control: AbstractControl) {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.structureService.validateEmail(control.value).pipe(
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public isInvalidStructureName(structureName: string): boolean {
    return structureNameChecker.isInvalidStructureName(structureName);
  }
}
