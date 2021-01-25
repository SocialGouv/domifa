import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { AppUser } from "../../../../../../../_common/model";
import { Usager } from "../../../../interfaces/usager";

import { UsagerService } from "../../../../services/usager.service";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-decision",
  styleUrls: ["./decision.component.css"],
  templateUrl: "./decision.component.html",
})
export class DecisionComponent implements OnInit {
  public labels: any;

  public submitted: boolean;
  public refusForm!: FormGroup;
  public valideForm!: FormGroup;

  public formDatas: any;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;

  public dateDebutPicker: NgbDateStruct;
  public dateFinPicker: NgbDateStruct;
  public maxDateRefus: NgbDateStruct;

  public usager: Usager;
  public isAdmin!: boolean;

  public me: AppUser;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usagerService: UsagerService,
    private modalService: NgbModal,
    private router: Router,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private matomo: MatomoTracker,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.labels = labels;
    this.submitted = false;
    this.isAdmin = false;

    const dToday = new Date();
    this.minDate = { day: 1, month: 1, year: dToday.getFullYear() - 1 };
    this.maxDate = { day: 31, month: 12, year: dToday.getFullYear() + 2 };
  }

  get r(): any {
    return this.refusForm.controls;
  }

  get v(): any {
    return this.valideForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Décision sur la domiciliation");
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      if (user !== null) {
        this.me = user;
        this.isAdmin =
          this.me.role === "admin" || this.me.role === "responsable";
      }
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = usager;
          this.initForm();
        },
        (error) => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public initForm() {
    this.usager.decision.dateDebut = new Date();
    this.usager.decision.dateFin = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    );

    this.usager.decision.dateFin.setDate(
      this.usager.decision.dateFin.getDate() - 1
    );

    this.dateDebutPicker = this.nbgDate.parseEn(
      this.usager.decision.dateDebut.toISOString()
    );

    this.dateFinPicker = this.nbgDate.parseEn(
      this.usager.decision.dateFin.toISOString()
    );

    this.maxDateRefus = this.dateDebutPicker;

    this.valideForm = this.formBuilder.group({
      dateDebut: [this.usager.decision.dateDebut, [Validators.required]],
      dateDebutPicker: [this.dateDebutPicker, [Validators.required]],
      dateFin: [this.usager.decision.dateFin, [Validators.required]],
      dateFinPicker: [this.dateFinPicker, [Validators.required]],
    });

    this.refusForm = this.formBuilder.group({
      dateFin: [this.usager.decision.dateFin, [Validators.required]],
      dateFinPicker: [this.dateDebutPicker, [Validators.required]],
      motif: [
        this.usager.decision.motif,
        [Validators.required, Validators.minLength(4)],
      ],
      motifDetails: [this.usager.decision.motifDetails, []],
      orientation: [
        this.usager.decision.orientation,
        [Validators.required, Validators.minLength(4)],
      ],
      orientationDetails: [
        this.usager.decision.orientationDetails,
        [Validators.required],
      ],
    });

    this.valideForm.get("dateFinPicker").valueChanges.subscribe((value) => {
      this.valideForm.controls.dateFin.setValue(
        new Date(this.nbgDate.formatEn(value))
      );
    });

    this.valideForm.get("dateDebutPicker").valueChanges.subscribe((value) => {
      if (value !== null && this.nbgDate.isValid(value)) {
        const newDateDebut = new Date(this.nbgDate.formatEn(value));

        this.usager.decision.dateFin = new Date(
          newDateDebut.setFullYear(newDateDebut.getFullYear() + 1)
        );
        this.usager.decision.dateFin.setDate(
          this.usager.decision.dateFin.getDate() - 1
        );
        this.dateFinPicker = this.nbgDate.parseEn(
          this.usager.decision.dateFin.toISOString()
        );

        this.valideForm.controls.dateDebut.setValue(
          new Date(this.nbgDate.formatEn(value))
        );

        this.valideForm.controls.dateFin.setValue(this.usager.decision.dateFin);
        this.valideForm.controls.dateFinPicker.setValue(this.dateFinPicker);
      }
    });

    this.refusForm.get("motif").valueChanges.subscribe((value) => {
      const customValidator = value === "AUTRE" ? Validators.required : null;
      this.refusForm.get("motifDetails").setValidators(customValidator);
    });
  }

  public setDecision(statut: string) {
    this.submitted = true;

    if (statut === "REFUS") {
      if (this.refusForm.invalid) {
        this.notifService.error(
          "Le formulaire contient une erreur, veuillez vérifier les champs"
        );
        return;
      }
      this.refusForm.controls.dateFin.setValue(
        new Date(
          this.nbgDate.formatEn(this.refusForm.controls.dateFinPicker.value)
        ).toISOString()
      );
      this.formDatas = this.refusForm.value;
    } else if (statut === "VALIDE") {
      if (this.valideForm.invalid) {
        this.notifService.error(
          "Le formulaire contient une erreur, veuillez vérifier les champs"
        );
        return;
      }

      this.valideForm.controls.dateDebut.setValue(
        new Date(
          this.nbgDate.formatEn(this.valideForm.get("dateDebutPicker").value)
        ).toISOString()
      );

      this.valideForm.controls.dateFin.setValue(
        new Date(
          this.nbgDate.formatEn(this.valideForm.get("dateFinPicker").value)
        ).toISOString()
      );

      this.formDatas = this.valideForm.value;
    } else {
      this.formDatas = { statut: "ATTENTE_DECISION" };
    }

    this.usagerService
      .setDecision(this.usager.id, this.formDatas, statut)
      .subscribe((usager: Usager) => {
        this.usager = usager;
        this.submitted = false;
        this.notifService.success("Décision enregistrée avec succès ! ");

        this.modalService.dismissAll();

        this.router.navigate(["usager/" + usager.id]);
      });
  }

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }
  public closeModal() {
    this.modalService.dismissAll();
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public printPage() {
    window.print();
    this.matomo.trackEvent(
      "tests",
      "impression_recapitulatif_decision",
      "null",
      1
    );
  }
}
