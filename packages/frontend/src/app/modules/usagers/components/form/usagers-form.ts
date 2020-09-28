import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";

import { Usager } from "src/app/modules/usagers/interfaces/usager";

import { UsagerService } from "src/app/modules/usagers/services/usager.service";

import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { User } from "src/app/modules/users/interfaces/user";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/validators";
import * as labels from "../../usagers.labels";

import { AyantDroit } from "../../interfaces/ayant-droit";

import {
  minDateNaissance,
  minDateToday,
  formatDateToNgb,
} from "src/app/shared/bootstrap-util";
import { Title } from "@angular/platform-browser";

@Component({
  animations: [fadeInOut],
  providers: [
    UsagerService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-usagers-form",
  styleUrls: ["./usagers-form.css"],
  templateUrl: "./usagers-form.html",
})
export class UsagersFormComponent implements OnInit {
  public labels: any;
  public doublons: Usager[];

  public selected: any;

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

  public usager!: Usager;
  public registerForm!: FormGroup;
  public usagerForm!: FormGroup;

  public submitted = false;
  public submittedFile = false;

  public modal: any;
  public structure: any;
  public etape: number;

  public liensLabels: any;

  public me: User;

  get f() {
    return this.usagerForm.controls;
  }

  get ayantsDroits() {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    public authService: AuthService,
    private matomo: MatomoTracker,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router,
    private notifService: ToastrService,
    private nbgDate: NgbDateCustomParserFormatter,
    private titleService: Title
  ) {
    this.labels = labels;
    this.doublons = [];

    this.liensLabels = Object.keys(this.labels.lienParente);

    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
    this.etape = 1;
  }

  public ngOnInit() {
    this.titleService.setTitle("État-civil du demandeur");

    this.authService.currentUser.subscribe((user) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = usager;

          this.initForm();
          for (const ayantDroit of this.usager.ayantsDroits) {
            this.addAyantDroit(ayantDroit);
          }
        },
        (error) => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.usager = new Usager({});
      this.initForm();
    }
  }

  public initForm() {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      dateNaissance: [this.usager.dateNaissance, []],
      dateNaissancePicker: [
        this.usager.dateNaissancePicker,
        [Validators.required],
      ],
      decision: [this.usager.decision, []],
      email: [this.usager.email, [Validators.email]],
      etapeDemande: [this.usager.etapeDemande, []],
      id: [this.usager.id, []],
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      preference: this.formBuilder.group({
        aucun: [this.usager.preference.aucun, []],
        email: [this.usager.preference.email, []],
        phone: [this.usager.preference.phone, []],
      }),
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      structure: [this.usager.structure, []],
      surnom: [this.usager.surnom, []],
      typeDom: [this.usager.typeDom],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]],
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
          this.usagerForm.controls.prenom.value
        )
        .subscribe((usagersDoublon: Usager[]) => {
          this.doublons = [];
          if (usagersDoublon.length !== 0) {
            this.notifService.warning("Un homonyme potentiel a été détecté !");
            usagersDoublon.forEach((doublon) => {
              this.doublons.push(new Usager(doublon));
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
        ayantDroit.dateNaissance,
        [Validators.pattern(regexp.date), Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public changeStep(i: number) {
    if (this.usager.decision.statut === "INSTRUCTION" && this.usager.id !== 0) {
      this.usager.etapeDemande = i;
    }
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.id, step)
      .subscribe((usager: Usager) => {
        this.router.navigate([
          "usager/" + this.usager.id + "/edit/rendez-vous",
        ]);
      });
  }

  public submitInfos() {
    this.submitted = true;
    if (this.usagerForm.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      const dateTmp = this.nbgDate.formatEn(
        this.usagerForm.controls.dateNaissancePicker.value
      );

      const dateTmpN = new Date(dateTmp).toISOString();
      this.usagerForm.controls.dateNaissance.setValue(dateTmpN);
      this.usagerForm.controls.etapeDemande.setValue(this.usager.etapeDemande);

      this.usagerService.create(this.usagerForm.value).subscribe(
        (usager: Usager) => {
          this.goToTop();
          this.notifService.success("Enregistrement réussi");
          this.router.navigate(["usager/" + usager.id + "/edit/rendez-vous"]);
        },
        (error) => {
          if (error.statusCode && error.statusCode === 400) {
            this.notifService.error(
              "Veuillez vérifiez les champs du formulaire"
            );
          }
        }
      );
    }
  }

  public goToTop() {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
  }
}
