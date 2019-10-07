import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal
} from "@ng-bootstrap/ng-bootstrap";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { UsersService } from "src/app/modules/users/services/users.service";
import { AuthService } from "src/app/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/services/date-french";
import { ENTRETIEN_LABELS, motifsRefus } from "src/app/shared/entretien.labels";
import { Usager } from "../../interfaces/usager";
import { DocumentService } from "../../services/document.service";
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

  public motifsRefus = {};
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

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private userService: UsersService,
    private documentService: DocumentService,
    private authService: AuthService,
    private structureService: StructureService,
    private route: ActivatedRoute,
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
    this.labels = ENTRETIEN_LABELS;
    this.motifsRefus = motifsRefus;
    this.motifsRefusList = Object.keys(this.motifsRefus);

    this.refusForm = this.formBuilder.group({
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
      this.formDatas = this.refusForm.value;
    }

    if (statut === "VALIDE") {
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
}
