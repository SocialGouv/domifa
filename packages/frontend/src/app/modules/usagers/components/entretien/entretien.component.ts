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
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { AppUser } from "../../../../../_common/model";
import { Entretien } from "../../interfaces/entretien";

@Component({
  providers: [UsagerService],
  selector: "app-entretien",
  styleUrls: ["./entretien.component.css"],
  templateUrl: "./entretien.component.html",
})
export class EntretienComponent implements OnInit {
  public labels: any;

  public typeMenageList: any;
  public residenceList: any;
  public causeList: any;
  public raisonList: any;

  public entretienForm!: FormGroup;

  @Input() public usager!: Usager;
  @Output() public usagerChange = new EventEmitter<Usager>();

  @Input() public editEntretien!: boolean;
  @Output() public editEntretienChange = new EventEmitter<boolean>();

  @Output()
  public nextStep = new EventEmitter<number>();

  @ViewChild("entretienConfirmation", { static: true })
  public entretienConfirmation!: TemplateRef<any>;

  public dirty: boolean;

  public me: AppUser;
  public entretienVide: Entretien;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private notifService: ToastrService,
    public modalService: NgbModal,
    public authService: AuthService
  ) {
    this.authService.currentUser.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.entretienVide = new Entretien();
  }

  get e(): any {
    return this.entretienForm.controls;
  }

  public ngOnInit() {
    this.labels = labels;

    this.residenceList = Object.keys(this.labels.residence);
    this.causeList = Object.keys(this.labels.cause);
    this.raisonList = Object.keys(this.labels.raison);
    this.typeMenageList = Object.keys(this.labels.typeMenage);

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

  public submitEntretien() {
    if (this.usager.decision.statut === "INSTRUCTION") {
      if (this.isEmptyForm()) {
        this.modalService.open(this.entretienConfirmation);
        return;
      }
    }

    this.usagerService
      .entretien(this.entretienForm.value, this.usager.id)
      .subscribe(
        (usager: Usager) => {
          this.usagerChange.emit(usager);
          this.editEntretienChange.emit(false);
          this.nextStep.emit(3);
          this.notifService.success("Enregistrement de l'entretien réussi");
        },
        (error) => {
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
