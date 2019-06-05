import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Usager } from '../../interfaces/usager';
import { DocumentService } from '../../services/document.service';
import { UsagerService } from '../../services/usager.service';
import { LABELS } from '../../shared/labels'

@Component({
  providers: [UsagerService],
  selector: 'app-profil',
  styleUrls: ['./profil.css'],
  templateUrl: './profil.html'
})

export class UsagersProfilComponent implements OnInit {
  [x: string]: any;

  public title: string;
  public usager: Usager;
  public labels: any;
  public notifLabels: string[] = ['courrierIn', 'recommandeIn', 'colisIn'];

  public notifInputs: {} = {
    'courrierIn': 1, 'recommandeIn': 0, 'colisIn': 0
  };

  public callToday = false;
  public visitToday = false;

  public successMessage: string;
  public errorMessage: string;


  public messages: any;

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();


  constructor(private usagerService: UsagerService, private route: ActivatedRoute, private documentService: DocumentService) {

  }

  public ngOnInit() {

    this.title = "Fiche d'un domicilié ";
    this.labels = LABELS;

    this.successSubject.subscribe((message: string) => { this.successMessage = message; this.errorMessage = null;});
    this.errorSubject.subscribe((message: string) => { this.errorMessage = message;this.successMessage = null;});
    this.successSubject.pipe(debounceTime(10000)).subscribe(() => this.successMessage = null);


    this.messages = {
      'courrierIn': 'Nouveaux courriers enregistrés',
      'courrierOut': 'Récupération du courrier enregistré !',
      'recommandeIn': 'Courrier recommandé enregistré !',
      'recommandeOut': 'Recommandés remis ',
    };

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;
      this.usagerService.findOne(id).subscribe( (usager: Usager) => {
        this.usager = new Usager(usager);

        this.callToday = this.isToday(new Date(usager.lastInteraction.appel));
        this.visitToday = this.isToday(new Date(usager.lastInteraction.visite));

      }, (error) => {
        /* Redirect */
      });
    }
    else {
      return "chips";
    }
  }

  public notifier() {
    for (const item of this.notifLabels) {
      if (this.notifInputs[item] !== 0) {
        this.usagerService.setInteraction(this.usager.id, {
          content: '',
          nbCourrier: this.notifInputs[item],
          type: item,
        }).subscribe((usager: Usager) => {
          this.usager.lastInteraction = usager.lastInteraction;
          console.log("item");
          console.log(item);
          console.log(this.messages[item]);
          this.changeSuccessMessage(this.messages[item]);
        }, (error) => {
          this.changeSuccessMessage("Impossible d'enregistrer cette interaction : ", true);
        });
      }
    }
  }

  public setPassage(type: string) {
    this.usagerService.setPassage(this.usager.id, type).subscribe((usager: Usager) => {
      this.changeSuccessMessage(this.messages[type]);
      this.usager.lastInteraction = usager.lastInteraction;
    }, (error) => {
      this.changeSuccessMessage("Impossible d'enregistrer cette interaction : " + type, true);
    });
  }

  public setInteraction(type: string) {
    // return this.usagerService.setInteraction(this.usager.id, type);
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public getDocument(i: number) {
    return this.documentService.getDocument(this.usager.id, i, this.usager.docs[i]);
  }

  public changeSuccessMessage(message: string, error?: boolean) {
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: 0,
    });
    error ? this.errorSubject.next(message) : this.successSubject.next(message);
  }


  private isToday(someDate?: Date) {

    if (!someDate) { return false; }
    console.log(someDate);
    console.log(typeof someDate);
    const today = new Date();

    return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
  }

}
