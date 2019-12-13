import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AuthService } from "src/app/services/auth.service";
import {
  interactionsLabels,
  interactionsNotifs
} from "../../interactions.labels";
import { Search } from "../../interfaces/search";
import { InteractionService } from "../../services/interaction.service";

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

  public stats: {
    ATTENTE_DECISION: number;
    INSTRUCTION: number;
    RADIE: number;
    REFUS: number;
    VALIDE: number;
  };

  @ViewChild("searchInput", { static: true })
  public searchInput: ElementRef;

  constructor(
    private usagerService: UsagerService,
    private interactionService: InteractionService,
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

    this.stats = {
      ATTENTE_DECISION: 0,
      INSTRUCTION: 0,
      RADIE: 0,
      REFUS: 0,
      VALIDE: 0
    };

    fromEvent(this.searchInput.nativeElement, "keyup")
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((text: any) => {
        text = text.trim();
        this.filters.name = text;
        this.searching = true;
        this.search();
      });

    this.search();
    this.getStats();
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

  public setInteraction(usager: Usager, type: string) {
    this.interactionService
      .setInteraction(usager.id, {
        content: "",
        type
      })
      .subscribe(
        (response: Usager) => {
          usager.lastInteraction = response.lastInteraction;
          this.notifService.success(this.notifs[type]);
        },
        error => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public getStats() {
    this.usagerService.getStats().subscribe((stats: any) => {
      stats[0].statut.forEach((stat: any) => {
        this.stats[stat.statut] = stat.sum;
      });
    });
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
