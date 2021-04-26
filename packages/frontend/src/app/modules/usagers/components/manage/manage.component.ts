import {
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaStatut,
} from "./usager-filter/UsagersFilterCriteria";
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  ReplaySubject,
  Subject,
  Subscription,
  timer,
} from "rxjs";
import {
  debounceTime,
  delayWhen,
  distinctUntilChanged,
  map,
  retryWhen,
  switchMap,
  tap,
} from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { fadeInOut, fadeInOutSlow } from "src/app/shared/animations";
import { AppUser, UsagerLight } from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";
import { interactionsLabels } from "../../interactions.labels";

import { InteractionService } from "../../services/interaction.service";
import { UsagerFormModel } from "../form/UsagerFormModel";
import {
  UsagersByStatus,
  usagersByStatusBuilder,
  usagersFilter,
  UsagersFilterCriteria,
  UsagersFilterCriteriaEcheance,
  UsagersFilterCriteriaSortKey,
  UsagersFilterCriteriaSortValues,
} from "./usager-filter";

@Component({
  animations: [fadeInOutSlow, fadeInOut],

  selector: "app-manage-usagers",
  styleUrls: ["./manage.css"],
  templateUrl: "./manage.html",
})
export class ManageUsagersComponent implements OnInit, OnDestroy {
  public searching: boolean;

  public allUsagers$ = new BehaviorSubject<UsagerLight[]>([]);
  public allUsagersByStatus$ = new ReplaySubject<UsagersByStatus>(1);
  public allUsagersByStatus: UsagersByStatus;
  public usagers: UsagerFormModel[] = [];
  public me: AppUser;

  public dateLabel: string;
  public today: Date;

  public labelsDateFin: { [key in UsagersFilterCriteriaStatut]: string } = {
    ATTENTE_DECISION: "Demande effectuée le",
    INSTRUCTION: "Dossier débuté le",
    RENOUVELLEMENT: "Renouvellement le",
    RADIE: "Radié le ",
    REFUS: "Date de refus",
    TOUS: "Fin de domiciliation",
    VALIDE: "Fin de domiciliation",
  };

  public labelsDernierPassage: {
    [key in UsagersFilterCriteriaDernierPassage]: string;
  } = {
    DEUX_MOIS: "Dernier passage 2 mois",
    TROIS_MOIS: "Dernier passage 3 mois",
  };

  public labelsEcheance: { [key in UsagersFilterCriteriaEcheance]: string } = {
    DEUX_MOIS: "Fin dans 2 mois",
    DEUX_SEMAINES: "Fin dans 2 semaines",
    DEPASSEE: "Domiciliation expirée",
  };

  public searchString = "";
  public filters: UsagersFilterCriteria;
  public filters$: Subject<UsagersFilterCriteria> = new ReplaySubject(1);

  public nbResults: number;

  public sortLabels: { [key: string]: string } = {
    NAME: "nom",
    ATTENTE_DECISION: "demande effectuée le",
    INSTRUCTION: "dossier débuté le",
    RADIE: "radié le ",
    REFUS: "date de refus",
    TOUS: "fin de domiciliation",
    VALIDE: "fin de domiciliation",
    PASSAGE: "date de dernier passage",
    ID: "ID",
  };

  public selectedUsager: UsagerFormModel;

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  @ViewChild("setInteractionInModal", { static: true })
  public setInteractionInModal!: TemplateRef<any>;

  @ViewChild("setInteractionOutModal", { static: true })
  public setInteractionOutModal!: TemplateRef<any>;

  @ViewChild("distributionBox", { static: true })
  public distributionBox: ElementRef;

  private subscription = new Subscription();

  constructor(
    private usagerService: UsagerService,
    private interactionService: InteractionService,
    private authService: AuthService,
    private modalService: NgbModal,
    private router: Router,
    private notifService: ToastrService,
    private titleService: Title,
    private matomo: MatomoTracker
  ) {}

  public ngOnInit() {
    this.usagers = [];
    this.searching = true;
    this.nbResults = 0;
    this.selectedUsager = {} as any;

    this.dateLabel = "Fin de domiciliation";
    this.filters = new UsagersFilterCriteria(this.getFilters());

    this.today = new Date();
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.titleService.setTitle("Gérer vos domiciliés");

    this.searchString = this.filters.searchString;
    this.filters.page = 0;
    this.filters$.next(this.filters);

    // reload every hour
    timer(0, 3600000)
      .pipe(
        switchMap(() => this.usagerService.getAllUsagers()),
        retryWhen((errors) =>
          // retry in case of error
          errors.pipe(
            tap((err) => console.log(`Error loading usagers`, err)),
            // retry in 5 seconds
            delayWhen(() => timer(5000))
          )
        )
      )
      .subscribe(
        (allUsagers: UsagerLight[]) => {
          this.allUsagers$.next(allUsagers);
        },
        () => {
          this.notifService.error("Une erreur a eu lieu lors de la recherche");
        }
      );

    this.allUsagers$.subscribe((allUsagers: UsagerLight[]) => {
      this.allUsagersByStatus = usagersByStatusBuilder.build(allUsagers);
      this.allUsagersByStatus$.next(this.allUsagersByStatus);
    });

    this.subscription.add(
      fromEvent(this.searchInput.nativeElement, "keyup")
        .pipe(
          map((event: Event) => {
            return (event.target as HTMLInputElement).value;
          }),
          debounceTime(50),
          map((filter) => (!filter ? filter : filter.trim())),
          distinctUntilChanged()
        )
        .subscribe((text: any) => {
          this.filters.searchString = text;
          this.filters.page = 0;
          this.filters$.next(this.filters);
        })
    );

    this.subscription.add(
      combineLatest([
        this.filters$.pipe(
          tap((filters) => {
            if (filters.page === 0) {
              window.scroll({
                behavior: "smooth",
                left: 0,
                top: 0,
              });
            }
          })
        ),
        this.allUsagersByStatus$,
      ]).subscribe(([filters, allUsagersByStatus]) => {
        this.applyFilters({ filters, allUsagersByStatus });
      })
    );
  }

  public updateUsager(usager: UsagerFormModel) {
    this.allUsagers$.next(
      this.allUsagers$.value.map((x) => {
        if (x.ref === usager.ref) {
          return usager;
        }
        return x;
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public resetSearchBar() {
    this.searchInput.nativeElement.value = "";
    this.filters.searchString = "";
    this.filters$.next(this.filters);
  }

  public getAttestation(usagerRef: number) {
    return this.usagerService.attestation(usagerRef);
  }

  public resetFilters() {
    this.filters = new UsagersFilterCriteria();
    this.filters$.next(this.filters);
  }

  public updateFilters<T extends keyof UsagersFilterCriteria>(
    element: T,
    value: UsagersFilterCriteria[T] | null,
    sortValue?: UsagersFilterCriteriaSortValues
  ) {
    if (
      element === "interactionType" ||
      element === "passage" ||
      element === "echeance"
    ) {
      const newValue = this.filters[element] === value ? null : value;
      this.filters[element] = newValue;
      this.filters.sortKey = "NAME";
      this.filters.sortValue = "ascending";
    } else if (element === "statut") {
      if (this.filters[element] === value) {
        return;
      }

      this.filters[element] = value;

      // Si le tri actuel est lié sur le statut
      if (
        this.filters.sortKey !== "NAME" &&
        this.filters.sortKey !== "ID" &&
        this.filters.sortKey !== "PASSAGE"
      ) {
        this.filters.sortKey = "NAME";
      }

      if (value !== "TOUS" && value !== "VALIDE") {
        this.filters.passage = null;
        this.filters.echeance = null;
        this.filters.interactionType = null;
        this.filters.sortKey = "NAME";
        this.filters.sortValue = "ascending";
      }
    } else if (element === "sortKey") {
      if (
        this.filters.statut === "TOUS" &&
        (value === "VALIDE" || value === "TOUS")
      ) {
        return;
      }

      // Tri issu des en-tête de tableau
      if (!sortValue) {
        sortValue =
          value === this.filters.sortKey
            ? this.filters.sortValue === "ascending"
              ? "descending"
              : "ascending"
            : "ascending";
      }

      this.filters.sortValue = sortValue;
      this.filters.sortKey = value as UsagersFilterCriteriaSortKey;
    } else {
      this.filters[element] = value;
    }

    this.filters.page = 0;
    this.filters$.next(this.filters);
    this.matomo.trackEvent("filters", element, value as string, 1);
  }

  public goToProfil(usager: UsagerFormModel) {
    const etapesUrl = [
      "etat-civil",
      "rendez-vous",
      "entretien",
      "documents",
      "decision",
    ];

    if (
      usager.decision.statut === "ATTENTE_DECISION" ||
      usager.decision.statut === "INSTRUCTION"
    ) {
      if (usager.typeDom === "RENOUVELLEMENT") {
        this.router.navigate(["usager/" + usager.ref]);
        return;
      }

      if (this.me.role === "facteur") {
        this.notifService.error("Vous ne pouvez pas accéder à ce profil");
        return;
      }

      if (usager.decision.statut === "INSTRUCTION") {
        this.router.navigate([
          "usager/" + usager.ref + "/edit/" + etapesUrl[usager.etapeDemande],
        ]);
      } else {
        this.router.navigate(["usager/" + usager.ref + "/edit/decision"]);
      }
    } else if (
      usager.decision.statut === "REFUS" &&
      this.me.role === "facteur"
    ) {
      this.notifService.error("Vous ne pouvez pas accéder à ce profil");
      return;
    } else {
      this.router.navigate(["usager/" + usager.ref]);
    }
  }

  public setInteraction(
    usager: UsagerFormModel,
    type: InteractionType,
    procuration?: boolean
  ): void {
    const interaction: {
      content?: string;
      type?: string;
      procuration?: boolean;
      transfert?: boolean;
      nbCourrier: number;
    } = {
      content: "",
      type,
      nbCourrier: 1,
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

    this.matomo.trackEvent("interactions", "manage", type, 1);

    this.interactionService.setInteraction(usager, interaction).subscribe(
      (newUsager: UsagerLight) => {
        usager = new UsagerFormModel(newUsager);
        this.updateUsager(usager);
        this.notifService.success(interactionsLabels[type]);
      },
      (error) => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public applyFilters({
    filters,
    allUsagersByStatus,
  }: {
    filters: UsagersFilterCriteria;
    allUsagersByStatus: UsagersByStatus;
  }) {
    this.searching = true;

    this.dateLabel = this.labelsDateFin[filters.statut];

    localStorage.setItem("filters", JSON.stringify(filters));

    const allUsagers = allUsagersByStatus[filters.statut];

    const filterCriteria: UsagersFilterCriteria = {
      ...filters,
      statut: undefined,
    };
    const filteredUsagers = usagersFilter.filter(allUsagers, {
      criteria: filterCriteria,
    });

    const pageSize = 40;
    if (filters.page === 0) {
      this.nbResults = filteredUsagers.length;
      this.usagers = filteredUsagers
        .slice(0, pageSize)
        .map((item) => new UsagerFormModel(item, filters));
    } else {
      this.usagers = this.usagers.concat(
        filteredUsagers
          .slice(filters.page * pageSize, filters.page * pageSize + 40)
          .map((item) => new UsagerFormModel(item, filters))
      );
    }
    this.searching = false;
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  private getFilters() {
    const filters = localStorage.getItem("filters");
    return filters === null ? {} : JSON.parse(filters);
  }

  public openInteractionInModal(usager: UsagerFormModel) {
    this.selectedUsager = usager;
    this.modalService.open(this.setInteractionInModal);
  }

  public openInteractionOutModal(usager: UsagerFormModel) {
    this.selectedUsager = usager;
    this.modalService.open(this.setInteractionOutModal);
  }

  public cancelReception() {
    this.selectedUsager = null;
    this.modalService.dismissAll();
  }

  public openDistributionBox() {}

  @HostListener("window:scroll", ["$event"])
  onScroll($event: Event): void {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;
    const pourcent = (pos / max) * 100;

    if (pourcent >= 80 && this.usagers.length < this.nbResults) {
      this.filters.page = this.filters.page + 1;
      this.filters$.next(this.filters);
    }
  }
}
