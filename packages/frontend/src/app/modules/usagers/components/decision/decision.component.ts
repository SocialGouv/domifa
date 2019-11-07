import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal
} from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "src/app/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/services/date-french";
import * as labels from "src/app/shared/entretien.labels";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";

@Component({
  providers: [
    UsagerService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ],
  selector: "app-decision",
  styleUrls: ["./decision.component.css"],
  templateUrl: "./decision.component.html"
})
export class DecisionComponent implements OnInit {
  public labels: any;
  public modal: any;

  public refusForm: FormGroup;
  public valideForm: FormGroup;

  public motifsRefusList = [];

  public formDatas: any;

  public dToday = new Date();

  public minDate = { day: 1, month: 1, year: 2018 };
  public maxDate = { day: 1, month: 1, year: this.dToday.getFullYear() + 2 };

  public dateDebutPicker = {
    day: this.dToday.getDate(),
    month: this.dToday.getMonth() + 1,
    year: this.dToday.getFullYear()
  };
  public dateFinPicker = {
    day: this.dToday.getDate(),
    month: this.dToday.getMonth() + 1,
    year: this.dToday.getFullYear() + 1
  };

  @Input() public usager: Usager;
  @Input() public isAdmin: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usagerService: UsagerService,
    private modalService: NgbModal,
    private router: Router,
    private nbgDate: NgbDateCustomParserFormatter
  ) {}

  get r(): any {
    return this.refusForm.controls;
  }

  get v(): any {
    return this.valideForm.controls;
  }

  public ngOnInit() {
    this.labels = labels;
    this.motifsRefusList = Object.keys(this.labels.motifsRefus);

    this.refusForm = this.formBuilder.group({
      dateFin: [this.usager.decision.dateFin, [Validators.required]],
      dateFinPicker: [this.dateDebutPicker, [Validators.required]],
      motif: [this.usager.decision.motif, [Validators.required]],
      motifDetails: [this.usager.decision.motifDetails, []],
      orientation: [this.usager.decision.orientation, [Validators.required]],
      orientationDetails: [
        this.usager.decision.orientationDetails,
        [Validators.required]
      ]
    });

    this.usager.decision.dateDebut = new Date();
    this.usager.decision.dateFin = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    );

    this.valideForm = this.formBuilder.group({
      dateDebut: [this.usager.decision.dateDebut, [Validators.required]],
      dateDebutPicker: [this.dateDebutPicker, [Validators.required]],
      dateFin: [this.usager.decision.dateFin, [Validators.required]],
      dateFinPicker: [this.dateFinPicker, [Validators.required]]
    });
  }

  public setDecision(statut: string) {
    if (statut === "REFUS") {
      if (this.refusForm.invalid) {
        return;
      }
      this.refusForm.controls.dateFin.setValue(
        new Date(
          this.nbgDate.formatEn(this.refusForm.get("dateFinPicker").value)
        ).toISOString()
      );
      this.formDatas = this.refusForm.value;
    } else if (statut === "VALIDE") {
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

      if (this.valideForm.invalid) {
        return;
      }
      this.formDatas = this.valideForm.value;
    } else {
      this.formDatas = { statut: "ATTENTE_DECISION" };
    }

    this.usagerService
      .setDecision(this.usager.id, this.formDatas, statut)
      .subscribe((usager: Usager) => {
        if (this.modal) {
          this.modal.close();
          this.router.navigate(["usager/" + usager.id]);
        }
        this.usager = new Usager(usager);
      });
  }

  public open(content: string) {
    this.modal = this.modalService.open(content);
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }
}
