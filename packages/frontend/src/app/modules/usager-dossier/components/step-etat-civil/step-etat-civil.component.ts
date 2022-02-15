import { UsagerAyantDroit } from "./../../../../../_common/model/usager/UsagerAyantDroit.type";
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
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

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import {
  formatDateToNgb,
  minDateNaissance,
  minDateToday,
} from "src/app/shared/bootstrap-util";

import {
  UsagerLight,
  UserStructure,
  Usager,
  CerfaDocType,
  LIEN_PARENTE_LABELS,
} from "../../../../../_common/model";
import { UsagerFormAyantDroit } from "../../../../../_common/model/usager/dossier";
import { fadeInOut, languagesAutocomplete } from "../../../../shared";
import { regexp } from "../../../../shared/validators";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel, AyantDroit } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  animations: [fadeInOut],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-step-etat-civil",
  styleUrls: ["./step-etat-civil.component.css"],
  templateUrl: "./step-etat-civil.component.html",
})
export class StepEtatCivilComponent implements OnInit {
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
  public loading = false;

  public languagesAutocomplete = languagesAutocomplete;

  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  public me: UserStructure;

  @ViewChildren("adNom") inputsAyantDroit: QueryList<ElementRef>;

  get f(): { [key: string]: AbstractControl } {
    return this.usagerForm.controls;
  }

  get ayantsDroits() {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private usagerDossierService: UsagerDossierService,
    private documentService: DocumentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public toastService: CustomToastService,
    private nbgDate: NgbDateCustomParserFormatter,
    private titleService: Title
  ) {
    this.doublons = [];

    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
  }

  public ngOnInit(): void {
    this.titleService.setTitle("État civil du demandeur");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: Usager) => {
          this.usager = new UsagerFormModel(usager);
          this.initForm();
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.usager = new UsagerFormModel();
      this.initForm();
    }
  }

  public initForm(): void {
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
      typeDom: [this.usager.typeDom, []],

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

  public isDoublon(): boolean {
    if (
      this.usagerForm.controls.nom.value !== "" &&
      this.usagerForm.controls.prenom.value !== "" &&
      this.usagerForm.controls.nom.value !== null &&
      this.usagerForm.controls.nom.value &&
      this.usagerForm.controls.prenom.value !== null &&
      this.usagerForm.controls.prenom.value
    ) {
      this.usagerDossierService
        .isDoublon(
          this.usagerForm.controls.nom.value,
          this.usagerForm.controls.prenom.value,
          this.usager.ref
        )
        .subscribe((usagersDoublon: UsagerLight[]) => {
          this.doublons = [];
          if (usagersDoublon.length !== 0) {
            this.toastService.warning("Un homonyme potentiel a été détecté !");
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
    this.focusAyantDroit();
  }

  public deleteAyantDroit(i: number): void {
    (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(i);

    const formAyantDroit = this.usagerForm.controls.ayantsDroits as FormArray;
    if (formAyantDroit.length === 0) {
      this.usagerForm.controls.ayantsDroitsExist.setValue(false);
    } else {
      this.focusAyantDroit();
    }
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

  public getCerfa(typeCerfa: CerfaDocType): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }

  public submitInfos(): void {
    this.submitted = true;

    if (this.usagerForm.invalid) {
      this.toastService.success(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }
    this.loading = true;

    const usagerFormValues = this.usagerForm.value;

    let ayantsDroits: UsagerAyantDroit[] = [];

    ayantsDroits = usagerFormValues.ayantsDroits.map(
      (ayantDroit: UsagerFormAyantDroit) => {
        return {
          lien: ayantDroit.lien,
          nom: ayantDroit.nom,
          prenom: ayantDroit.prenom,
          dateNaissance: new Date(
            this.nbgDate.formatEn(ayantDroit.dateNaissance)
          ),
        };
      }
    );

    const formValue: UsagerFormModel = {
      ...usagerFormValues,
      ayantsDroits,
      dateNaissance: this.nbgDate.formatEn(
        this.usagerForm.controls.dateNaissance.value
      ),

      etapeDemande: this.usager.etapeDemande,
    };

    if (!formValue.preference.phone) {
      formValue.preference.phoneNumber = null;
    }

    // if (formValue.typeDom === "RENOUVELLEMENT") {
    //   formValue.datePremiereDom = new Date(
    //     this.nbgDate.formatEn(this.usagerForm.controls.datePremiereDom.value)
    //   );
    //  }

    this.usagerDossierService.create(formValue).subscribe({
      next: (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.nextStep();
      },
      error: () => {
        this.loading = false;
        this.toastService.error("Veuillez vérifier les champs du formulaire");
      },
    });
  }

  private focusAyantDroit() {
    // Focus sur l'élément créé
    setTimeout(() => {
      const ayantDroitTable = this.usagerForm.controls.ayantsDroits.value;
      const inputs = this.inputsAyantDroit.toArray();
      inputs[ayantDroitTable.length - 1].nativeElement.focus();
    }, 500);
  }
  private nextStep(): void {
    this.usagerDossierService
      .nextStep(this.usager.ref, 2)
      .subscribe((usager: UsagerLight) => {
        this.toastService.success("Enregistrement réussi");
        this.router.navigate(["usager/" + usager.ref + "/edit/rendez-vous"]);
      });
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
