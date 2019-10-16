import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { fromEvent, Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AuthService } from "src/app/services/auth.service";
import {
  interactionsLabels,
  interactionsNotifs
} from "../../interactions.labels";
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
  public usagers: Usager[] = [];

  public prenom: string;
  public dateLabel: string;

  public labelsDateFin: any = {
    ATTENTE_DECISION: "Demande effectuée le",
    INSTRUCTION: "Dossier débuté le",
    RADIE: "Radié le ",
    REFUS: "Date de refus",
    VALIDE: "Fin de domiciliation"
  };

  public notifs = interactionsNotifs;
  public interactionsLabels = interactionsLabels;

  public filters: Search;
  public sort: string;

  @ViewChild("searchInput", { static: true })
  public searchInput: ElementRef;

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private router: Router,
    private notifService: ToastrService
  ) {}

  public ngOnInit() {
    this.filters = localStorage.getItem("filters")
      ? new Search(JSON.parse(localStorage.getItem("filters")))
      : new Search({});

    this.title = "Gérer vos domiciliés";
    this.usagers = [];
    this.searching = false;
    this.dateLabel = "Fin de domiciliation";
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

  public getAttestation(usagerId: number) {
    return this.usagerService.attestation(usagerId);
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
      RADIE: "usager/" + id,
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

  public setPassage(usager: Usager, type: string) {
    this.usagerService
      .setInteraction(usager.id, {
        content: "",
        type
      })
      .subscribe(
        () => {
          if (type === "courrierOut") {
            usager.lastInteraction.nbCourrier = 0;
          }
          this.notifService.success(this.notifs[type]);
        },
        error => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public search() {
    this.dateLabel =
      this.filters.statut !== null
        ? this.labelsDateFin[this.filters.statut]
        : "Date de fin";

    localStorage.setItem("filters", JSON.stringify(this.filters));
    this.usagerService.search(this.filters).subscribe(
      (usagers: Usager[]) => {
        this.usagers = usagers;
        this.searching = false;
      },
      error => {
        this.notifService.error("Une erreur a eu lieu lors de la recherche");
      }
    );
  }
}
