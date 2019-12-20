import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as entretienLabels from "../../../../shared/entretien.labels";
import {
  interactionsLabels,
  interactionsNotifs
} from "../../interactions.labels";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal
} from "@ng-bootstrap/ng-bootstrap";

import { LoadingService } from "../../../loading/loading.service";
import { DocumentService } from "../../services/document.service";

import { ToastrService } from "ngx-toastr";

import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/services/date-french";
import { regexp } from "src/app/shared/validators";
import { AyantDroit } from "../../interfaces/ayant-droit";
import { Interaction } from "../../interfaces/interaction";
import { Usager } from "../../interfaces/usager";
import { InteractionService } from "../../services/interaction.service";
import { UsagerService } from "../../services/usager.service";

@Component({
  providers: [
    UsagerService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ],
  selector: "app-profil",
  styleUrls: ["./profil.css"],
  templateUrl: "./profil.html"
})
export class UsagersProfilComponent implements OnInit {
  public editInfos: boolean;
  public editEntretien: boolean;
  public editAyantsDroits: boolean;

  public interactions: Interaction[];
  public interactionsType: string[] = ["courrierIn", "recommandeIn", "colisIn"];

  public interactionsNotifs: any = interactionsNotifs;
  public interactionsLabels: any = interactionsLabels;

  public labels: any;
  public liensLabels: any;
  public modal: any;

  public motifsRadiation: any = entretienLabels.motifsRadiation;
  public motifsRefus: any = entretienLabels.motifsRefus;
  public residence = {};

  public typeMenageList: any;
  public residenceList: any;
  public causeList: any;
  public raisonList: any;

  public title: string;

  public usager: Usager;

  public usagerForm: FormGroup;
  public ayantsDroitsForm: FormGroup;

  public decisionLabels = {
    ATTENTE_DECISION: "Demande de domiciliation déposée",
    IMPORT: "Dossier importé sur Domifa",
    INSTRUCTION: "Instruction du dossier",
    PREMIERE_DOM: "Première domiciliation",
    RADIE: "Radiation",
    REFUS: "Demande refusée",
    VALIDE: "Domiciliation acceptée"
  };

  public notifInputs: {} = {
    colisIn: 0,
    courrierIn: 0,
    recommandeIn: 0
  };

  constructor(
    private documentService: DocumentService,
    private formBuilder: FormBuilder,
    private interactionService: InteractionService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private modalService: NgbModal,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private usagerService: UsagerService
  ) {}

  public ngOnInit() {
    this.title = "Fiche d'un domicilié";

    this.labels = entretienLabels;
    this.liensLabels = Object.keys(this.labels.lienParente);

    this.interactions = [];

    this.editInfos = false;
    this.editAyantsDroits = false;
    this.editEntretien = false;

    if (this.route.snapshot.params.id) {
      this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
        (usager: Usager) => {
          if (usager.decision.statut === "ATTENTE_DECISION") {
            this.router.navigate(["/usager/" + usager.id + "/edit"]);
          }

          this.usager = usager;
          this.goToTop();
          this.getInteractions();
          this.initForms();
        },
        error => {
          this.router.navigate(["/404"]);
        }
      );
    } else {
      this.router.navigate(["/404"]);
      return;
    }
  }

  get f() {
    return this.usagerForm.controls;
  }

  get ayantsDroits() {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  public initForms() {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      dateNaissance: [this.usager.dateNaissance, []],
      dateNaissancePicker: [
        this.usager.dateNaissancePicker,
        [Validators.required]
      ],
      email: [this.usager.email, [Validators.email]],
      id: [this.usager.id, []],
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      structure: [this.usager.structure, []],
      surnom: [this.usager.surnom, []],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]]
    });

    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }
  }

  public updateInfos() {
    if (this.usagerForm.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      const dateTmp = this.nbgDate.formatEn(
        this.usagerForm.get("dateNaissancePicker").value
      );

      const dateTmpN = new Date(dateTmp).toISOString();
      this.usagerForm.controls.dateNaissance.setValue(dateTmpN);

      this.usagerService.create(this.usagerForm.value).subscribe(
        (usager: Usager) => {
          this.notifService.success("Enregistrement réussi");
          this.usager = new Usager(usager);
          this.editInfos = false;
          this.editAyantsDroits = false;
        },
        error => {
          if (error.statusCode && error.statusCode === 400) {
            this.notifService.error(
              "Veuillez vérifiez les champs du formulaire"
            );
          }
        }
      );
    }
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

  public newAyantDroit(ayantDroit: AyantDroit) {
    return this.formBuilder.group({
      dateNaissance: [
        ayantDroit.dateNaissance,
        [Validators.pattern(regexp.date), Validators.required]
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required]
    });
  }

  public renouvellement() {
    this.usagerService.renouvellement(this.usager.id).subscribe(
      (usager: Usager) => {
        this.usager = usager;
        this.modal.close();
        this.router.navigate(["usager/" + usager.id + "/edit"]);
        this.notifService.success(
          "Votre demande a été enregistrée. Merci de remplir l'ensemble du dossier"
        );
      },
      error => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public open(content: string) {
    this.modal = this.modalService.open(content);
  }

  public deleteInteraction(idInteraction: string) {
    this.interactionService
      .delete(this.usager.id, idInteraction)
      .subscribe((result: any) => {
        if (result && result.ok) {
          this.getInteractions();
        }
      });
  }

  public deleteUsager() {
    this.usagerService.delete(this.usager.id).subscribe(
      (result: any) => {
        this.modal.close();
        this.notifService.success("Usager supprimé avec succès");
        this.router.navigate(["/manage"]);
      },
      error => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }

  public notifier() {
    for (const item of this.interactionsType) {
      if (this.notifInputs[item] !== 0) {
        this.interactionService
          .setInteraction(this.usager.id, {
            content: "",
            nbCourrier: this.notifInputs[item],
            type: item
          })
          .subscribe(
            (usager: Usager) => {
              this.notifService.success(this.interactionsNotifs[item]);
              this.usager = usager;
              this.usager.lastInteraction = usager.lastInteraction;
              this.notifInputs[item] = 0;
              this.getInteractions();
            },
            error => {
              this.notifService.error(
                "Impossible d'enregistrer cette interaction"
              );
            }
          );
      }
    }
  }

  public setPassage(type: string) {
    this.interactionService
      .setInteraction(this.usager.id, {
        content: "",
        type
      })
      .subscribe(
        (usager: Usager) => {
          this.usager = usager;
          this.notifService.success(this.interactionsNotifs[type]);
          this.usager.lastInteraction = usager.lastInteraction;
          this.getInteractions();
        },
        error => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public getDocument(i: number) {
    return this.documentService.getDocument(
      this.usager.id,
      i,
      this.usager.docs[i]
    );
  }

  public deleteDocument(i: number): void {
    this.documentService.deleteDocument(this.usager.id, i).subscribe(
      (usager: Usager) => {
        this.usager.docs = new Usager(usager).docs;
      },
      error => {
        this.notifService.error("Impossible de supprimer le document");
      }
    );
  }

  public goToTop() {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
  }

  private getInteractions() {
    this.interactionService
      .getInteractions(this.usager.id)
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }
}
