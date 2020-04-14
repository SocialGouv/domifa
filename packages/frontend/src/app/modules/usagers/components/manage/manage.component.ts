import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { fadeInOut, fadeInOutSlow } from "src/app/shared/animations";
import { Structure } from "../../../structures/structure.interface";
import { interactionsNotifs } from "../../interactions.labels";
import { InteractionTypes } from "../../interfaces/interaction";
import { Filters, Search } from "../../interfaces/search";
import { InteractionService } from "../../services/interaction.service";

@Component({
  animations: [fadeInOutSlow, fadeInOut],
  providers: [UsagerService],
  selector: "app-manage-usagers",
  styleUrls: ["./manage.css"],
  templateUrl: "./manage.html",
})
export class ManageUsagersComponent implements OnInit {
  public title: string;
  public searching: boolean;
  public usagers: Usager[] = [];
  public dateLabel: string;

  public labelsDateFin: any = {
    ATTENTE_DECISION: "Demande effectuée le",
    INSTRUCTION: "Dossier débuté le",
    RADIE: "Radié le ",
    REFUS: "Date de refus",
    TOUS: "Fin de domiciliation",
    VALIDE: "Fin de domiciliation",
  };

  public notifs: { [key: string]: any } = interactionsNotifs;

  public filters: Search;
  public nbResults: number;

  public stats: {
    INSTRUCTION: number;
    VALIDE: number;
    ATTENTE_DECISION: number;
    RENOUVELLEMENT: number;
    REFUS: number;
    RADIE: number;
    TOUS: number;
  };

  public structure: Structure;
  public selectedUsager: Usager;

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  constructor(
    private usagerService: UsagerService,
    private interactionService: InteractionService,
    public authService: AuthService,
    public modalService: NgbModal,
    private router: Router,
    private notifService: ToastrService
  ) {
    this.title = "Gérer vos domiciliés";
    this.usagers = [];
    this.searching = true;
    this.dateLabel = "Fin de domiciliation";
    this.filters = new Search();
    this.filters.page = 0;
    this.nbResults = 0;
    this.selectedUsager = new Usager();
    this.structure =
      this.authService.currentUserValue !== null
        ? this.authService.currentUserValue.structure
        : new Structure();

    this.stats = {
      INSTRUCTION: 0,
      VALIDE: 0,
      ATTENTE_DECISION: 0,
      RENOUVELLEMENT: 0,
      REFUS: 0,
      RADIE: 0,
      TOUS: 0,
    };
  }

  public ngOnInit() {
    this.filters = new Search(this.getFilters());
    this.getStats();
    this.search();

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
        this.search();
      });
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

  public updateFilters(element: Filters, value: string | null) {
    if (
      element === "interactionType" ||
      element === "statut" ||
      element === "passage" ||
      element === "echeance" ||
      element === "name"
    ) {
      const newValue = this.filters[element] === value ? null : value;
      this.filters[element] = newValue;
    } else {
      this.filters[element] = value;
    }

    if (element === "statut") {
      if (value !== "TOUS" && value !== "VALIDE") {
        this.filters.passage = null;
        this.filters.echeance = null;
        this.filters.interactionType = null;
      }
    }
    this.filters.page = 0;
    this.search();
  }

  public goToProfil(usager: Usager) {
    const url: { [key: string]: any } = {
      ATTENTE_DECISION: "usager/" + usager.id + "/edit",
      INSTRUCTION: "usager/" + usager.id + "/edit",
      RADIE: "usager/" + usager.id,
      REFUS: "usager/" + usager.id,
      VALIDE: "usager/" + usager.id,
    };

    if (
      usager.typeDom === "RENOUVELLEMENT" &&
      (usager.decision.statut === "ATTENTE_DECISION" ||
        usager.decision.statut === "INSTRUCTION")
    ) {
      this.router.navigate(["usager/" + usager.id]);
      return;
    }
    this.router.navigate([url[usager.decision.statut]]);
  }

  public setInteraction(
    usager: Usager,
    type: InteractionTypes,
    procuration?: boolean
  ) {
    const interaction: {
      content?: string;
      type?: string;
      procuration?: boolean;
      transfert?: boolean;
    } = {
      content: "",
      type,
    };

    if (type === "courrierOut" && usager.options.procuration.actif) {
      if (typeof procuration === "undefined") {
        this.selectedUsager = usager;
        this.modalService.open(this.distributionConfirm);
        // open
        return;
      }
      this.modalService.dismissAll();
      interaction.procuration = procuration;
    }

    if (type === "courrierOut" && usager.options.transfert.actif) {
      interaction.transfert = true;
    }

    this.interactionService.setInteraction(usager, interaction).subscribe(
      (response: Usager) => {
        usager.lastInteraction = response.lastInteraction;
        this.notifService.success(this.notifs[type]);
      },
      (error) => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public getStats() {
    this.usagerService.getStats().subscribe((stats: any) => {
      this.stats = stats;
    });
  }

  public search() {
    this.searching = true;

    this.dateLabel =
      this.filters.statut !== null
        ? this.labelsDateFin[this.filters.statut]
        : "Date de fin";

    localStorage.setItem("filters", JSON.stringify(this.filters));

    this.usagerService.search(this.filters).subscribe(
      (response: { results: Usager[] | Usager; nbResults: number }) => {
        const usagers = Array.isArray(response.results)
          ? response.results.map((item) => new Usager(item))
          : [new Usager(response)];

        if (this.filters.page === 0) {
          this.nbResults = response.nbResults;
          this.usagers = usagers;

          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        } else {
          this.usagers = this.usagers.concat(usagers);
        }
        this.searching = false;
      },
      (error) => {
        this.searching = false;
        this.notifService.error("Une erreur a eu lieu lors de la recherche");
      }
    );
  }

  private getFilters() {
    const filters = localStorage.getItem("filters");
    return filters === null ? {} : JSON.parse(filters);
  }

  @HostListener("window:scroll", ["$event"])
  onScroll($event: Event): void {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;
    const pourcent = (pos / max) * 100;

    if (pourcent >= 80 && this.usagers.length < this.nbResults) {
      this.filters.page = this.filters.page + 1;
      this.search();
    }
  }
}
