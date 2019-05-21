import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Usager } from 'src/app/modules/usagers/interfaces/usager';
import { UsagerService } from 'src/app/modules/usagers/services/usager.service';
@Component({
  providers: [UsagerService],
  selector: 'app-manage-usagers',
  styleUrls: ['./manage.css'],
  templateUrl: './manage.html'
})

export class ManageUsagersComponent implements OnInit {
  public title: string;
  public searching: boolean;
  public searchFailed: boolean;
  public usagers: Usager[];

  @ViewChild('searchInput')
  public searchInput: ElementRef;

  public filters: {
    statut: string,
    name: string,
    echeance: string,
    courrier: boolean,
    id: number
  };

  constructor( private usagerService: UsagerService) {
  }

  public ngOnInit() {
    // this.user = this.userService.getUser();

    this.filters =  {
      courrier: null,
      echeance: null,
      id: null,
      name: null,
      statut: null,
    };

    this.title = "Gérer vos domiciliés";

    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(map((event: any) => {
      return event.target.value;
    })
    ,debounceTime(300)
    ,distinctUntilChanged()).subscribe((text: any) => {
      this.filters.name = null;
      if (text !== '') {
        isNaN(text) ? this.filters.name = text : this.filters.id = text;
      }
      this.searching = true;
      this.search();
    });

    this.search();
  }

  public getAttestation(idUsager) {
    return this.usagerService.attestation(idUsager);
  }

  public updateFilters(filter: string, value: string) {
    /* Filter */
  }

  public search() {

    this.usagerService.search(this.filters).subscribe((usagers: Usager[]) => {
      this.usagers = usagers;
      this.searching = false;
    },(error) => {
      console.log('Erreur ! : ' + error);
    } );

  }
}
