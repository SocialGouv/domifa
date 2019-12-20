import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";

import { ToastrService } from "ngx-toastr";
import * as labels from "src/app/shared/entretien.labels";

@Component({
  providers: [UsagerService],
  selector: "app-entretien",
  styleUrls: ["./entretien.component.css"],
  templateUrl: "./entretien.component.html"
})
export class EntretienComponent implements OnInit {
  public labels: any;
  public title: string;

  public residence = {};

  public typeMenageList: any;
  public residenceList: any;
  public causeList: any;
  public raisonList: any;
  public liensLabels: any;

  public entretienForm: FormGroup;

  @Input() public usager: Usager;
  @Output() public usagerChange = new EventEmitter<Usager>();

  @Input() public editEntretien: boolean;
  @Output() public editEntretienChange = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private modalService: NgbModal
  ) {}

  get e(): any {
    return this.entretienForm.controls;
  }

  public ngOnInit() {
    this.labels = labels;

    this.residence = this.labels.residence;
    this.residenceList = Object.keys(this.residence);
    this.causeList = Object.keys(this.labels.cause);
    this.raisonList = Object.keys(this.labels.raison);
    this.typeMenageList = Object.keys(this.labels.typeMenage);
    this.liensLabels = Object.keys(this.labels.lienParente);

    this.entretienForm = this.formBuilder.group({
      accompagnement: [
        this.usager.entretien.accompagnement,
        [Validators.required]
      ],
      accompagnementDetail: [this.usager.entretien.accompagnementDetail, []],
      cause: [this.usager.entretien.cause, []],
      causeDetail: [this.usager.entretien.causeDetail, []],
      commentaires: [this.usager.entretien.commentaires, []],
      domiciliation: [this.usager.entretien.domiciliation, []],
      liencommune: [this.usager.entretien.liencommune, []],
      orientation: [this.usager.entretien.orientation, []],
      orientationDetail: [this.usager.entretien.orientationDetail, []],
      raison: [this.usager.entretien.raison, []],
      raisonDetail: [this.usager.entretien.raisonDetail, []],
      residence: [this.usager.entretien.residence, []],
      residenceDetail: [this.usager.entretien.residenceDetail, []],
      revenus: [this.usager.entretien.revenus, []],
      revenusDetail: [this.usager.entretien.revenusDetail, []],
      typeMenage: [this.usager.entretien.typeMenage, []]
    });
  }

  public submitEntretien() {
    this.usagerService
      .entretien(this.entretienForm.value, this.usager.id)
      .subscribe(
        (usager: Usager) => {
          this.usagerChange.emit(usager);
          this.editEntretienChange.emit(false);
          this.notifService.success("Enregistrement de l'entretien réussi");
        },
        error => {
          this.notifService.error("Impossible d'enregistrer l'entretien");
        }
      );
  }
}
