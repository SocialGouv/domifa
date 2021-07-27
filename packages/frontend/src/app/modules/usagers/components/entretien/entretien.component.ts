import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { UsagerLight } from "../../../../../_common/model";
import { ENTRETIEN_LIEN_COMMUNE } from "../../../../../_common/model/usager/constants";
import { Entretien } from "../../interfaces/entretien";

@Component({
  selector: "app-entretien",
  styleUrls: ["./entretien.component.css"],
  templateUrl: "./entretien.component.html",
})
export class EntretienComponent implements OnInit {
  public labels: any;

  public ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;

  public entretienForm!: FormGroup;

  @Input() public usager!: UsagerLight;
  @Output() public usagerChanges = new EventEmitter<UsagerLight>();

  @Input() public editEntretien!: boolean;
  @Output() public editEntretienChange = new EventEmitter<boolean>();

  @Output()
  public nextStep = new EventEmitter<number>();

  @ViewChild("entretienConfirmation", { static: true })
  public entretienConfirmation!: TemplateRef<any>;

  public dirty: boolean;

  public entretienVide: Entretien;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private modalService: NgbModal
  ) {
    this.entretienVide = new Entretien();
  }

  get e(): any {
    return this.entretienForm.controls;
  }

  public ngOnInit() {
    this.labels = labels;

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
        return;
      }
    }

    this.usagerService
      .entretien(this.entretienForm.value, this.usager.ref)
      .subscribe(
        (usager: UsagerLight) => {
          this.usagerChanges.emit(usager);
          this.editEntretienChange.emit(false);
          this.nextStep.emit(3);
          this.notifService.success("Enregistrement de l'entretien réussi");
        },
        (error: any) => {
          this.notifService.error("Impossible d'enregistrer l'entretien");
        }
      );
  }

  private isEmptyForm() {
    return (
      Object.keys(this.entretienForm.value).filter(
        (x) => this.entretienForm.value[x] !== null
      ).length === 0
    );
  }
}
