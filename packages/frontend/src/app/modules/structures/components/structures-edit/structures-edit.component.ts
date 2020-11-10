import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { departements } from "src/app/shared/departements";
import { regexp } from "src/app/shared/validators";
import { AppUser } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

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

  public modal: any;
  public exportLoading: boolean;

  public showHardReset: boolean;
  public hardResetCode: boolean;
  public hardResetForm!: FormGroup;

  public me: AppUser;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
    private router: Router,
    public authService: AuthService,
    public modalService: NgbModal,
    private titleService: Title
  ) {
    this.departements = departements;
    this.showHardReset = false;
    this.hardResetCode = null;

    this.authService.currentUser.subscribe((user: AppUser) => {
      this.me = user;
    });
  }

  get f() {
    return this.structureEdit.controls;
  }

  get h() {
    return this.hardResetForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Editer votre structure");

    this.structureService.findMyStructure().subscribe((structure: any) => {
      this.structure = structure;
      this.initForms();
    });
  }

  public initForms() {
    this.hardResetForm = this.formBuilder.group({
      token: ["", [Validators.required]],
    });

    const adresseRequired =
      this.structure.adresseCourrier.actif === true
        ? [Validators.required]
        : null;

    const assoRequired =
      this.structure.structureType === "asso" ? [Validators.required] : null;

    this.structureEdit = this.formBuilder.group({
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
        colis: [this.structure.options.colis, []],
        customId: [this.structure.options.customId, []],
        numeroBoite: [this.structure.options.numeroBoite, []],
        rattachement: [this.structure.options.rattachement, []],
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

    this.structureEdit
      .get("adresseCourrier")
      .get("actif")
      .valueChanges.subscribe((value) => {
        const isRequired = value === true ? [Validators.required] : null;

        this.structureEdit
          .get("adresseCourrier")
          .get("adresse")
          .setValidators(isRequired);
        this.structureEdit
          .get("adresseCourrier")
          .get("codePostal")
          .setValidators(isRequired);
        this.structureEdit
          .get("adresseCourrier")
          .get("ville")
          .setValidators(isRequired);
      });
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
          this.notifService.success(
            "Les modifications ont bien été prises en compte"
          );
          this.authService.currentUserValue.structure = structure;
        },
        (error) => {
          this.notifService.error("Une erreur est survenue");
        }
      );
    }
  }

  public open(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
  }

  public hardReset() {
    this.structureService.hardReset().subscribe((retour: any) => {
      this.showHardReset = true;
    });
  }

  public hardResetConfirm() {
    if (this.hardResetForm.invalid) {
      this.notifService.error("Veuillez vérifier le formulaire");
    } else {
      this.structureService
        .hardResetConfirm(this.hardResetForm.controls.token.value)
        .subscribe(
          (retour: any) => {
            this.notifService.success(
              "La remise à zéro a été effectuée avec succès !"
            );
            this.modalService.dismissAll();
            this.showHardReset = false;
          },
          (error: any) => {
            this.notifService.error(
              "La remise à zéro n'a pas pu être effectuée !"
            );
          }
        );
    }
  }

  public export() {
    this.exportLoading = true;
    this.structureService.export().subscribe(
      (x: any) => {
        const newBlob = new Blob([x], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(newBlob, "export_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 500);
      },
      (error: any) => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.exportLoading = false;
      }
    );
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
