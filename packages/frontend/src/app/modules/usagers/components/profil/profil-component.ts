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

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbDateCustomParserFormatter } from "src/app/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/services/date-french";
import { regexp } from "src/app/shared/validators";
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
  public interactions: Interaction[];
  public interactionsLabels: any;
  public interactionsType: string[] = ["courrierIn", "recommandeIn", "colisIn"];
  public labels: any;
  public modal: any;
  public motifsRadiation: any = entretienLabels.motifsRadiation;
  public motifsRefus: any = entretienLabels.motifsRefus;
  public notifs: any;
  public title: string;
  public usager: Usager;
  public usagerForm: FormGroup;

  public decisionLabels = {
    ATTENTE_DECISION: "Demande de domiciliation déposée",
    IMPORT: "Dossier importé",
    INSTRUCTION: "Instruction du dossier",
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
    this.editInfos = false;
    this.interactions = [];
    this.notifs = interactionsNotifs;
    this.interactionsLabels = interactionsLabels;

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;
      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = usager;
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

  public initForms() {
    this.usagerForm = this.formBuilder.group({
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
              this.notifService.success(this.notifs[item]);
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
          this.notifService.success(this.notifs[type]);
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

  private getInteractions() {
    this.interactionService
      .getInteractions(this.usager.id)
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }
}
