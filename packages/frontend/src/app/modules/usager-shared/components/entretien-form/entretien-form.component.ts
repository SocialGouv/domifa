import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight } from "../../../../../_common/model";
import {
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_CAUSE_INSTABILITE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_RESIDENCE,
} from "../../../../../_common/model/usager/_constants";
import { Entretien } from "../../interfaces";

import { EntretienService } from "../../services/entretien.service";

@Component({
  selector: "app-entretien-form",
  styleUrls: ["./entretien-form.component.css"],
  templateUrl: "./entretien-form.component.html",
})
export class EntretienFormComponent implements OnInit {
  public ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;
  public ENTRETIEN_TYPE_MENAGE = ENTRETIEN_TYPE_MENAGE;
  public ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;
  public ENTRETIEN_RAISON_DEMANDE = ENTRETIEN_RAISON_DEMANDE;
  public ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;

  public entretienForm!: FormGroup;

  @Input() public usager!: UsagerLight;
  @Output() public usagerChanges = new EventEmitter<UsagerLight>();

  @Input() public editEntretien!: boolean;
  @Output() public editEntretienChange = new EventEmitter<boolean>();

  @Output()
  public nextStep = new EventEmitter<number>();

  @ViewChild("entretienConfirmation", { static: true })
  public entretienConfirmation!: TemplateRef<NgbModalRef>;

  public loading = false;

  public entretienVide: Entretien;

  constructor(
    private formBuilder: FormBuilder,
    private entretienService: EntretienService,
    private toastService: CustomToastService,
    private modalService: NgbModal
  ) {
    this.entretienVide = new Entretien();
  }

  get e(): { [key: string]: AbstractControl } {
    return this.entretienForm.controls;
  }

  public ngOnInit(): void {
    this.entretienForm = this.formBuilder.group({
      accompagnement: [
        this.usager.entretien.accompagnement,
        [Validators.required],
      ],
      accompagnementDetail: [this.usager.entretien.accompagnementDetail, []],
      cause: [this.usager.entretien.cause, []],
      causeDetail: [this.usager.entretien.causeDetail, []],
      commentaires: [this.usager.entretien.commentaires, []],
      domiciliation: [this.usager.entretien.domiciliation, []],
      liencommune: [this.usager.entretien.liencommune, []],
      liencommuneDetail: [this.usager.entretien.liencommuneDetail, []],
      orientation: [this.usager.entretien.orientation, []],
      orientationDetail: [this.usager.entretien.orientationDetail, []],
      rattachement: [this.usager.entretien.rattachement, []],
      raison: [this.usager.entretien.raison, []],
      raisonDetail: [this.usager.entretien.raisonDetail, []],
      residence: [this.usager.entretien.residence, []],
      residenceDetail: [this.usager.entretien.residenceDetail, []],
      revenus: [this.usager.entretien.revenus, []],
      revenusDetail: [this.usager.entretien.revenusDetail, []],
      typeMenage: [this.usager.entretien.typeMenage, []],
    });
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  public submitEntretien() {
    if (this.usager.decision.statut === "INSTRUCTION") {
      if (this.isEmptyForm()) {
        this.modalService.open(this.entretienConfirmation);
        this.loading = false;
        return;
      }
    }
    this.loading = true;
    this.entretienService
      .submitEntretien(this.entretienForm.value, this.usager.ref)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.usagerChanges.emit(usager);
          this.editEntretienChange.emit(false);
          this.nextStep.emit(3);
          this.toastService.success("Enregistrement de l'entretien réussi");
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'enregistrer l'entretien");
        },
      });
  }

  private isEmptyForm() {
    return (
      Object.keys(this.entretienForm.value).filter(
        (x) => this.entretienForm.value[x] !== null
      ).length === 0
    );
  }
}
