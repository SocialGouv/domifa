import { Component, Injectable, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Usager } from 'src/app/modules/usagers/interfaces/usager';
import { UsagerService } from 'src/app/modules/usagers/services/usager.service';

@Component({
  providers: [UsagerService],
  selector: 'app-manage-usagers',
  styleUrls: ['./manage.css'],
  templateUrl: './manage.html'

})

export class ManageUsagersComponent implements OnInit {
  public title;
  public searching: boolean;
  public searchFailed: boolean;
  public usagers: Usager[];
  public filters: {};

  constructor( private usagerService: UsagerService) {
  }

  public ngOnInit() {
    this.filters = {
      statut: null,
      name: null,
      echeance: null,
      courrier: null
    };

    this.title = "Gérer vos domiciliés";
    this.search('');
  }

  public getAttestation(idUsager) {
    return this.usagerService.attestation(idUsager);
  }

  public updateFilters(filter: string, value: string) {

  }

  public search(term?: string) {
    this.usagerService.search(term).subscribe(
      (usagers: Usager[]) => {
        console.log(usagers);
        this.usagers = usagers;
        console.log(this.usagers);
        console.log('RECHERCHE OK');
      },
      (error) => {
        console.log('Erreur ! : ' + error);
      }
      );

    }

  }
