import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Usager } from 'src/app/modules/usagers/interfaces/usager';
import { UsagerService } from 'src/app/modules/usagers/services/usager.service';
import { Search } from '../../interfaces/search';

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
  public searchWord: string;

  public filters: Search;

  @ViewChild('searchInput')
  public searchInput: ElementRef;


  constructor( private usagerService: UsagerService, private router: Router) {
  }

  public ngOnInit() {
    // this.user = this.userService.getUser();

    this.filters =  new Search({});
    this.title = "Gérer vos domiciliés";
    this.usagers = [];
    this.searching = false;

    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(map((event: any) => {
      return event.target.value;
    })
    ,debounceTime(300)
    ,distinctUntilChanged()).subscribe((text: any) => {
      this.filters.name = null;
      this.filters.id = null;
      text = text.trim();
      if (text !== '') {
        isNaN(text) ? this.filters.name = text : this.filters.id = text;
      }
      this.searching = true;
      this.search();
    });

    this.search();
  }

  public getSearchBar() {
    return this.searchInput.nativeElement.value;
  }
  public resetSearchBar() {
    this.filters.name = null;
    this.filters.id = null;
    this.searchInput.nativeElement.value = '';
    this.search();
  }

  public getAttestation(idUsager: number) {
    return this.usagerService.attestation(idUsager);
  }

  public resetFilters() {
    this.filters = new Search({});
    this.search();
  }

  public updateFilters(filter: string, value: any) {
    /* Filter */
    this.filters[filter] = this.filters[filter] === value ? null : value;
    this.search();
  }

  public goToProfil(id: number, statut: string) {
    const urlParams = (statut === 'instruction' || statut === 'demande') ? '/edit' : '';
    const url = 'profil/' + id + urlParams;
    this.router.navigate([url]);

  }
  public search() {
    this.usagerService.search(this.filters).subscribe((usagers: Usager[]) => {
      this.usagers = usagers;
      this.searching = false;
    },(error) => {
    });

  }
}
