import { Component, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { departements } from "../../../../shared/constants";

import { regexp } from "../../../../shared/validators";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

@Component({
  selector: "app-structure-edit-form",
  templateUrl: "./structure-edit-form.component.html",
  styleUrls: ["./structure-edit-form.component.css"],
})
export class StructureEditFormComponent implements OnInit {
  public structureForm: FormGroup;
  public departements: any;
  public success: boolean = false;
  public submitted: boolean = false;

  @Input() public structure: Structure;

  constructor(
    private structureService: StructureService,
    private formBuilder: FormBuilder,
    private notifService: ToastrService
  ) {
    this.submitted = false;
    this.departements = departements;
  }

  get f() {
    return this.structureForm.controls;
  }

  public ngOnInit() {
    const adresseRequired =
      this.structure.adresseCourrier.actif === true
        ? [Validators.required]
        : null;

    const assoRequired =
      this.structure.structureType === "asso" ? [Validators.required] : null;

    this.structureForm = this.formBuilder.group({
      adresse: [this.structure.adresse, [Validators.required]],
      agrement: [this.structure.agrement, assoRequired],
      capacite: [this.structure.capacite, []],
      codePostal: [
        this.structure.codePostal,
        [
          Validators.maxLength(5),
          this.structureService.codePostalValidator(),
          Validators.required,
        ],
      ],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, assoRequired],
      email: [
        this.structure.email,
        [Validators.required, Validators.pattern(regexp.email)],
      ],
      nom: [this.structure.nom, [Validators.required]],
      options: this.formBuilder.group({
        numeroBoite: [this.structure.options.numeroBoite, []],
      }),
      adresseCourrier: this.formBuilder.group({
        actif: [this.structure.adresseCourrier.actif, []],
        adresse: [this.structure.adresseCourrier.adresse, adresseRequired],
        ville: [this.structure.adresseCourrier.ville, adresseRequired],
        codePostal: [
          this.structure.adresseCourrier.codePostal,
          adresseRequired,
        ],
      }),
      phone: [
        this.structure.phone,
        [Validators.required, Validators.pattern(regexp.phone)],
      ],

      responsable: this.formBuilder.group({
        fonction: [this.structure.responsable.fonction, [Validators.required]],
        nom: [this.structure.responsable.nom, [Validators.required]],
        prenom: [this.structure.responsable.prenom, [Validators.required]],
      }),

      ville: [this.structure.ville, [Validators.required]],
    });

    this.structureForm
      .get("adresseCourrier")
      .get("actif")
      .valueChanges.subscribe((value: any) => {
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

  public submitStrucutre() {
    this.submitted = true;
    if (this.structureForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
    } else {
      this.structureService.patch(this.structureForm.value).subscribe(
        (structure: Structure) => {
          this.notifService.success(
            "Les modifications ont bien été prises en compte"
          );
          this.structure = structure;
        },
        (error) => {
          this.notifService.error("Une erreur est survenue");
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
}
