import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { fromEvent, Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AuthService } from "src/app/services/auth.service";
import { Search } from "../../interfaces/search";

@Component({
  providers: [UsagerService],
  selector: "app-manage-usagers",
  styleUrls: ["./manage.css"],
  templateUrl: "./manage.html"
})
export class ManageUsagersComponent implements OnInit {
  public title: string;
  public searching: boolean;
  public searchFailed: boolean;
  public usagers: Usager[];
  public prenom: string;

  public filters: Search;
  public sort: string;

  public successMessage: string;
  public errorMessage: string;

  @ViewChild("searchInput", { static: true })
  public searchInput: ElementRef;

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  public ngOnInit() {
    this.filters = localStorage.getItem("filters")
      ? new Search(JSON.parse(localStorage.getItem("filters")))
      : new Search({});

    this.title = "Gérer vos domiciliés";
    this.usagers = [];
    this.searching = false;

    this.authService.currentUser.subscribe(user => {
      this.prenom = user !== null ? user.prenom : "";
    });

    fromEvent(this.searchInput.nativeElement, "keyup")
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((text: any) => {
        text = text.trim();
        this.filters.name = text;
        this.searching = true;
        this.search();
      });

    this.search();
  }

  public getSearchBar() {
    return this.searchInput.nativeElement.value;
  }

  public resetSearchBar() {
    this.searchInput.nativeElement.value = "";
    this.filters.name = "";
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
    this.filters[filter] = this.filters[filter] === value ? null : value;
    this.search();
  }

  public goToProfil(id: number, statut: string) {
    const url = {
      ATTENTE_DECISION: "usager/" + id + "/edit",
      INSTRUCTION: "usager/" + id + "/edit",
      RADIE: "radiation/" + id,
      REFUS: "usager/" + id,
      VALIDE: "usager/" + id
    };

    this.router.navigate([url[statut]]);
  }

  public getLetter(nom: string): string {
    return nom.charAt(0).toUpperCase();
  }

  public differentLetter(nom: string, i: number): boolean {
    if (i !== undefined && i > 0) {
      return (
        this.usagers[i - 1].nom.charAt(0).toUpperCase() !==
        nom.charAt(0).toUpperCase()
      );
    }
    return true;
  }

  public search() {
    localStorage.setItem("filters", JSON.stringify(this.filters));
    this.usagerService.search(this.filters).subscribe(
      (usagers: Usager[]) => {
        this.usagers = usagers;
        this.searching = false;
      },
      error => {
        this.changeSuccessMessage(
          "Une erreur a eu lieu lors de la recherche",
          true
        );
      }
    );
  }

  private changeSuccessMessage(message: string, error?: boolean) {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
    error ? this.errorSubject.next(message) : this.successSubject.next(message);
  }
}
