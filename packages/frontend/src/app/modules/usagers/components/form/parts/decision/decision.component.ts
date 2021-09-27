import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { addYears, subDays } from "date-fns";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { UserStructure } from "../../../../../../../_common/model";
import { MOTIFS_REFUS_LABELS } from "../../../../../../../_common/model/usager/constants/MOTIFS_REFUS_LABELS.const";
import { UsagerDecisionForm } from "../../../../../../../_common/model/usager/UsagerDecisionForm.type";
import { UsagerLight } from "../../../../../../../_common/model/usager/UsagerLight.type";
import { formatDateToNgb } from "../../../../../../shared/bootstrap-util";
import { DocumentService } from "../../../../../usager-shared/services/document.service";
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
  public MOTIFS_REFUS_LABELS = MOTIFS_REFUS_LABELS;

  public submitted: boolean;
  public refusForm!: FormGroup;
  public valideForm!: FormGroup;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public maxDateRefus: NgbDateStruct;

  public usager: UsagerLight;
  public isAdmin!: boolean;

  public me: UserStructure;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usagerService: UsagerService,
    private documentService: DocumentService,
    private modalService: NgbModal,
    private router: Router,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private matomo: MatomoTracker,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.submitted = false;
    this.isAdmin = false;

    const dToday = new Date();
    this.minDate = { day: 1, month: 1, year: dToday.getFullYear() - 1 };
    this.maxDate = { day: 31, month: 12, year: dToday.getFullYear() + 2 };
    this.maxDateRefus = formatDateToNgb(new Date());
  }

  get r(): any {
    return this.refusForm.controls;
  }

  get v(): any {
    return this.valideForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Décision sur la domiciliation");
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      if (user !== null) {
        this.me = user;
        this.isAdmin =
          this.me.role === "admin" || this.me.role === "responsable";
      }
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: UsagerLight) => {
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
    this.usager.decision.dateFin = addYears(new Date(), 1);

    this.valideForm = this.formBuilder.group({
      dateDebut: [
        formatDateToNgb(this.usager.decision.dateDebut),
        [Validators.required],
      ],
      dateFin: [
        formatDateToNgb(this.usager.decision.dateFin),
        [Validators.required],
      ],
    });

    this.refusForm = this.formBuilder.group({
      dateFin: [
        formatDateToNgb(this.usager.decision.dateDebut),
        [Validators.required],
      ],
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

    this.valideForm.get("dateDebut").valueChanges.subscribe((value) => {
      if (value !== null && this.nbgDate.isValid(value)) {
        const newDateFin = subDays(
          addYears(new Date(this.nbgDate.formatEn(value)), 1),
          1
        );

        this.valideForm.controls.dateFin.setValue(formatDateToNgb(newDateFin));
      }
    });

    this.refusForm.get("motif").valueChanges.subscribe((value) => {
      if (value === "AUTRE") {
        this.refusForm.get("motifDetails").setValidators(Validators.required);
      } else {
        this.refusForm.get("motifDetails").setValidators(null);
        this.refusForm.get("motifDetails").setValue(null);
      }
    });
  }

  public setDecision(statut: string) {
    this.submitted = true;

    let formDatas: UsagerDecisionForm = { statut: "ATTENTE_DECISION" };

    if (statut === "REFUS") {
      if (this.refusForm.invalid) {
        this.notifService.error(
          "Le formulaire contient une erreur, veuillez vérifier les champs"
        );
        return;
      }

      formDatas = {
        ...this.refusForm.value,
        statut: "REFUS",
        dateFin: new Date(
          this.nbgDate.formatEn(this.refusForm.controls.dateFin.value)
        ),
      };
      //
    } else if (statut === "VALIDE") {
      if (this.valideForm.invalid) {
        this.notifService.error(
          "Le formulaire contient une erreur, veuillez vérifier les champs"
        );
        return;
      }

      formDatas = {
        ...this.valideForm.value,
        statut: "VALIDE",
        dateDebut: new Date(
          this.nbgDate.formatEn(this.valideForm.controls.dateDebut.value)
        ),
        dateFin: new Date(
          this.nbgDate.formatEn(this.valideForm.controls.dateFin.value)
        ),
      };
    }

    this.usagerService
      .setDecision(this.usager.ref, formDatas)
      .subscribe((usager: UsagerLight) => {
        if (usager.decision.statut === "ATTENTE_DECISION") {
          this.submitted = false;
          this.usager = usager;
        } else {
          this.notifService.success("Décision enregistrée avec succès ! ");
          this.router.navigate(["profil/general/" + usager.ref]);
        }
        this.modalService.dismissAll();
      });
  }

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  public getAttestation() {
    return this.documentService.attestation(this.usager.ref);
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
