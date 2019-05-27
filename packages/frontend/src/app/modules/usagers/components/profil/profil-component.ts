import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  constructor(private usagerService: UsagerService, private route: ActivatedRoute, private documentService: DocumentService) {

  }

  public ngOnInit() {

    this.title = "Fiche d'un domicilié ";
    this.labels = LABELS;

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;
      this.usagerService.findOne(id).subscribe( (usager: Usager) => {
        this.usager = new Usager(usager);
      }, (error) => {
        /* Redirect */
      });
    }
    else {
      return "chips";
    }
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public getDocument(i: number) {
    return this.documentService.getDocument(this.usager.id, i, this.usager.docs[i]);
  }

}
