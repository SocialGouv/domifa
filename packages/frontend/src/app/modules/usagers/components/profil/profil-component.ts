import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ENTRETIEN_LABELS,
  motifsRadiation,
  motifsRefus
} from "../../../../shared/entretien.labels";
import { LoadingService } from "../../../loading/loading.service";
import { DocumentService } from "../../services/document.service";

import { ToastrService } from "ngx-toastr";

import { Interaction } from "../../interfaces/interaction";
import { LastInteraction } from "../../interfaces/last-interaction";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";

@Component({
  providers: [UsagerService],
  selector: "app-profil",
  styleUrls: ["./profil.css"],
  templateUrl: "./profil.html"
})
export class UsagersProfilComponent implements OnInit {
  public title: string;
  public usager: Usager;
  public interactions: Interaction[];

  public motifsRadiation: any = motifsRadiation;
  public motifsRefus: any = motifsRefus;
  public labels: any;

  public interactionsType: string[] = ["courrierIn", "recommandeIn", "colisIn"];
  public interactionsLabel: any = {
    appel: "Appel",
    colisIn: "Colis reçu",
    colisOut: "Colis récupéré",
    courrierIn: "Courrier reçu",
    courrierOut: "Courrier récupéré",
    recommandeIn: "Recommandé reçu",
    recommandeOut: "Recommandé récupéré",
    visite: "Visite"
  };

  public notifInputs: {} = {
    colisIn: 0,
    courrierIn: 0,
    recommandeIn: 0
  };

  public messages = {
    appel: "Appel téléphonique enregistré",
    courrierIn: "Nouveaux courriers enregistrés",
    courrierOut: "Récupération du courrier enregistrée !",
    recommandeIn: "Courrier recommandé enregistré !",
    recommandeOut: "Avis de passage remis ",
    visite: "Passage de l'usager enregistré"
  };

  constructor(
    private usagerService: UsagerService,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private loadingService: LoadingService,
    private notifService: ToastrService,
    private router: Router
  ) {}

  public ngOnInit() {
    this.title = "Fiche d'un domicilié ";
    this.labels = ENTRETIEN_LABELS;

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;
      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = new Usager(usager);

          this.getInteractions();
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

  public notifier() {
    for (const item of this.interactionsType) {
      if (this.notifInputs[item] !== 0) {
        this.usagerService
          .setInteraction(this.usager.id, {
            content: "",
            nbCourrier: this.notifInputs[item],
            type: item
          })
          .subscribe(
            (usager: Usager) => {
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
    this.usagerService
      .setInteraction(this.usager.id, {
        content: "",
        type
      })
      .subscribe(
        (usager: Usager) => {
          this.notifService.success(this.messages[type]);
          this.usager.lastInteraction = new LastInteraction(
            usager.lastInteraction
          );
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
    this.usagerService
      .getInteractions(this.usager.id)
      .subscribe((interactions: any) => {
        this.interactions = interactions;
      });
  }
}
