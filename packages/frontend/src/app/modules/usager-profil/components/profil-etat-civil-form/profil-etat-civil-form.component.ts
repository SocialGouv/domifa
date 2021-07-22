import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";

import { ToastrService } from "ngx-toastr";
import { UsagerLight } from "../../../../../_common/model";
import { languagesAutocomplete } from "../../../../shared";
import {
  formatDateToNgb,
  minDateNaissance,
} from "../../../../shared/bootstrap-util";
import { LIENS_PARENTE } from "../../../../shared/constants/USAGER_LABELS.const";
import { regexp } from "../../../../shared/validators";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { AyantDroit } from "../../../usagers/interfaces/ayant-droit";

import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-etat-civil-form",
  templateUrl: "./profil-etat-civil-form.component.html",
  styleUrls: ["./profil-etat-civil-form.component.css"],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class ProfilEtatCivilFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Output() public usagerChanges = new EventEmitter<UsagerLight>();

  public usagerForm!: FormGroup;
  public submitted: boolean;

  public languagesAutocomplete = languagesAutocomplete;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  public LIENS_PARENTE = LIENS_PARENTE;

  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  @Output() public editInfosChange = new EventEmitter<boolean>();

  get f() {
    return this.usagerForm.controls;
  }

  get ayantsDroits() {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private usagerService: UsagerService
  ) {
    this.submitted = false;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
    this.usager = new UsagerFormModel();
  }

  public ngOnInit(): void {
    this.initForms();
  }

  public initForms() {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      customRef: [this.usager.customRef, []],
      dateNaissance: [
        formatDateToNgb(this.usager.dateNaissance),
        [Validators.required],
      ],
      email: [this.usager.email, [Validators.email]],
      ref: [this.usager.ref, [Validators.required]],
      langue: [this.usager.langue, languagesAutocomplete.validator("langue")],
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, []],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]],
    });

    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }
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

  public updateInfos() {
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

      this.usagerService.create(formValue).subscribe(
        (usager: UsagerLight) => {
          this.submitted = false;
          this.editInfosChange.emit(false);
          this.notifService.success("Enregistrement réussi");

          this.usagerChanges.emit(usager);
        },
        () => {
          this.notifService.error("Veuillez vérifiez les champs du formulaire");
        }
      );
    }
  }
}
