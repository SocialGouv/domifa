import { animate, style, transition, trigger } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { debounceTime } from "rxjs/operators";
import { ENTRETIEN_LABELS } from "../../../../shared/entretien.labels";
import { LoadingService } from "../../../loading/loading.service";
import { DocumentService } from "../../services/document.service";

import { error } from "@angular/compiler/src/util";
import { of, Subject } from "rxjs";
import { Interaction } from "../../interfaces/interaction";
import { LastInteraction } from "../../interfaces/last-interaction";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";

const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate(300, style({ opacity: 1 }))
  ]),
  transition(":leave", [animate(150, style({ opacity: 0 }))])
]);

@Component({
  animations: [fadeInOut],
  providers: [UsagerService],
  selector: "app-profil",
  styleUrls: ["./profil.css"],
  templateUrl: "./profil.html"
})
export class UsagersProfilComponent implements OnInit {
  public title: string;
  public usager: Usager;
  public interactions: Interaction[];

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

  public callToday = false;
  public visitToday = false;
  public successMessage: string;
  public errorMessage: string;
  public messages: any;

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

  constructor(
    private usagerService: UsagerService,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  public ngOnInit() {
    this.title = "Fiche d'un domicilié ";
    this.labels = ENTRETIEN_LABELS;

    this.successSubject.subscribe((message: string) => {
      this.successMessage = message;
      this.errorMessage = null;
    });
    this.errorSubject.subscribe((message: string) => {
      this.errorMessage = message;
      this.successMessage = null;
    });
    this.successSubject
      .pipe(debounceTime(10000))
      .subscribe(() => (this.successMessage = null));

    this.messages = {
      appel: "Appel de l'usager enregistré",
      courrierIn: "Nouveaux courriers enregistrés",
      courrierOut: "Récupération du courrier enregistré !",
      recommandeIn: "Courrier recommandé enregistré !",
      recommandeOut: "Recommandés remis ",
      visite: "Passage de l'usager enregistré"
    };

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;
      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = new Usager(usager);
          this.callToday = this.isToday(new Date(usager.lastInteraction.appel));
          this.visitToday = this.isToday(
            new Date(usager.lastInteraction.visite)
          );
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
              this.changeSuccessMessage(
                "Impossible d'enregistrer cette interaction",
                true
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
          this.changeSuccessMessage(this.messages[type]);
          this.usager.lastInteraction = new LastInteraction(
            usager.lastInteraction
          );
          this.getInteractions();
        },
        error => {
          this.changeSuccessMessage(
            "Impossible d'enregistrer cette interaction : " + type,
            true
          );
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

  public changeSuccessMessage(message: string, error?: boolean) {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
    error ? this.errorSubject.next(message) : this.successSubject.next(message);
  }

  private getInteractions() {
    this.usagerService
      .getInteractions(this.usager.id)
      .subscribe((interactions: any) => {
        this.interactions = interactions;
      });
  }
  private isToday(someDate?: Date) {
    if (!someDate) {
      return false;
    }
    const today = new Date();

    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  }
}
