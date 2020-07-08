import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { departements } from "src/app/shared/departements";
import { regexp } from "src/app/shared/validators";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-structures-edit",
  styleUrls: ["./structures-edit.component.css"],
  templateUrl: "./structures-edit.component.html",
})
export class StructuresEditComponent implements OnInit {
  public success: boolean = false;
  public structureEdit: FormGroup;
  public structure: Structure;
  public departements: any;
  public submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
    private router: Router,
    private authService: AuthService,
    private titleService: Title
  ) {
    this.departements = departements;
  }

  get f() {
    return this.structureEdit.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Editer votre structure");

    this.structureService.findMyStructure().subscribe((structure: any) => {
      this.structure = structure;
      this.initForm();
    });
  }

  public initForm() {
    this.structureEdit = this.formBuilder.group({
      adresse: [this.structure.adresse, [Validators.required]],
      adresseCourrier: [this.structure.adresseCourrier, []],
      adresseDifferente: [this.structure.adresseCourrier, []],
      agrement: [this.structure.agrement, []],
      capacite: [this.structure.capacite, []],
      codePostal: [
        this.structure.codePostal,
        [
          Validators.maxLength(5),
          this.structureService.validateCodePostal.bind(this),
          Validators.required,
        ],
      ],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, []],
      email: [
        this.structure.email,
        [Validators.required, Validators.pattern(regexp.email)],
      ],
      nom: [this.structure.nom, [Validators.required]],
      options: this.formBuilder.group({
        colis: [this.structure.options.colis, []],
        customId: [this.structure.options.customId, []],
        numeroBoite: [this.structure.options.numeroBoite, []],
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

    if (this.structure.structureType === "asso") {
      this.structureEdit.get("agrement").setValidators(Validators.required);
      this.structureEdit.get("departement").setValidators(Validators.required);
    } else {
      this.structureEdit.get("agrement").setValidators(null);
      this.structureEdit.get("departement").setValidators(null);
    }
    this.structureEdit.get("agrement").updateValueAndValidity();
    this.structureEdit.get("departement").updateValueAndValidity();
  }

  public submitStrucutre() {
    this.submitted = true;
    if (this.structureEdit.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
    } else {
      this.structureService.patch(this.structureEdit.value).subscribe(
        (structure: Structure) => {
          this.notifService.success("La structure a bien été enregistrée");
          this.authService.currentUserValue.structure = structure;
          this.router.navigate(["/mon-compte"]);
        },
        (error) => {
          this.notifService.error("Veuillez vérifier les champs du formulaire");
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
