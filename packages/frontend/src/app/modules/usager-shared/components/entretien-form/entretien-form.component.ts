import { UsagerFormModel } from "./../../interfaces/UsagerFormModel";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";
import {
  ENTRETIEN_CAUSE_INSTABILITE,
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_SITUATION_PRO,
  ENTRETIEN_TYPE_MENAGE,
} from "@domifa/common";

import { Entretien } from "../../interfaces";

import { Subscription } from "rxjs";
import { UsagerService } from "../../services/usagers.service";
import { NoWhiteSpaceValidator } from "../../../../shared";

@Component({
  selector: "app-entretien-form",
  styleUrls: ["./entretien-form.component.css"],
  templateUrl: "./entretien-form.component.html",
})
export class EntretienFormComponent implements OnInit, OnDestroy {
  public readonly ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;
  public readonly ENTRETIEN_TYPE_MENAGE = ENTRETIEN_TYPE_MENAGE;
  public readonly ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;
  public readonly ENTRETIEN_RAISON_DEMANDE = ENTRETIEN_RAISON_DEMANDE;
  public readonly ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;
  public readonly ENTRETIEN_SITUATION_PRO = ENTRETIEN_SITUATION_PRO;

  public entretienForm!: UntypedFormGroup;
  private readonly subscription = new Subscription();

  @Input() public usager!: UsagerFormModel;

  @Input() public editEntretien!: boolean;
  @Output() public readonly editEntretienChange = new EventEmitter<boolean>();

  @Output()
  public readonly nextStep = new EventEmitter<number>();

  @ViewChild("entretienConfirmation", { static: true })
  public entretienConfirmation!: TemplateRef<NgbModalRef>;

  public loading = false;
  public entretienVide: Entretien;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerService: UsagerService,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal
  ) {
    this.entretienVide = new Entretien();
  }

  public get e(): { [key: string]: AbstractControl } {
    return this.entretienForm.controls;
  }

  public ngOnInit(): void {
    this.entretienForm = this.formBuilder.group({
      accompagnement: [this.usager.entretien.accompagnement],
      accompagnementDetail: [
        this.usager.entretien.accompagnementDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
      cause: [this.usager.entretien.cause, []],
      causeDetail: [this.usager.entretien.causeDetail, [NoWhiteSpaceValidator]],
      commentaires: [
        this.usager.entretien.commentaires,
        [Validators.maxLength(2000)],
      ],
      domiciliation: [this.usager.entretien.domiciliation, []],
      liencommune: [
        this.usager.entretien.liencommune,
        [Validators.maxLength(1000)],
      ],
      liencommuneDetail: [
        this.usager.entretien.liencommuneDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
      orientation: [this.usager.entretien.orientation, []],
      orientationDetail: [
        this.usager.entretien.orientationDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
      rattachement: [this.usager.entretien.rattachement, []],
      raison: [this.usager.entretien.raison, []],
      raisonDetail: [
        this.usager.entretien.raisonDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
      residence: [this.usager.entretien.residence, []],
      residenceDetail: [
        this.usager.entretien.residenceDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
      revenus: [this.usager.entretien.revenus, []],
      revenusDetail: [
        this.usager.entretien.revenusDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
      typeMenage: [this.usager.entretien.typeMenage, []],
      situationPro: [this.usager.entretien.situationPro, []],
      situationProDetail: [
        this.usager.entretien.situationProDetail,
        [NoWhiteSpaceValidator, Validators.maxLength(1000)],
      ],
    });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public submitEntretien(): void {
    if (this.usager.decision.statut === "INSTRUCTION") {
      if (this.isEmptyForm()) {
        this.modalService.open(
          this.entretienConfirmation,
          DEFAULT_MODAL_OPTIONS
        );
        this.loading = false;
        return;
      }
    }
    this.loading = true;
    this.subscription.add(
      this.usagerService
        .submitEntretien(this.entretienForm.value, this.usager.ref)
        .subscribe({
          next: () => {
            this.editEntretienChange.emit(false);
            this.nextStep.emit(3);
            this.toastService.success("Enregistrement de l'entretien réussi");
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'enregistrer l'entretien");
          },
        })
    );
  }

  private isEmptyForm(): boolean {
    return (
      Object.keys(this.entretienForm.value).filter(
        (x) => this.entretienForm.value[x] !== null
      ).length === 0
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
