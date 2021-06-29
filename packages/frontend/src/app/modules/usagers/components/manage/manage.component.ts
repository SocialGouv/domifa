import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
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
import { getDateToDisplay } from "../../interfaces/getDateToDisplay.service";
import { getUrlUsagerProfil } from "../../interfaces/getUrlUsagerProfil.service";
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
import { UsagersFilterCriteriaDernierPassage } from "./usager-filter/UsagersFilterCriteria";

const AUTO_REFRESH_PERIOD = 3600000; // 1h
@Component({
  animations: [fadeInOutSlow, fadeInOut],

  selector: "app-manage-usagers",
  styleUrls: ["./manage.css"],
  templateUrl: "./manage.html",
})
export class ManageUsagersComponent implements OnInit, OnDestroy {
  public searching: boolean;
  public loading: boolean;

  public allUsagers$ = new BehaviorSubject<UsagerLight[]>([]);
  public allUsagersByStatus$ = new ReplaySubject<UsagersByStatus>(1);
  public allUsagersByStatus: UsagersByStatus;
  public usagers: UsagerLight[] = [];
  public me: AppUser;

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

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  private subscription = new Subscription();

  public sortLabel = "échéance";
  public echeanceSortLabel = "échéance";

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private notifService: ToastrService,
    private titleService: Title,
    private matomo: MatomoTracker
  ) {}

  public ngOnInit() {
    this.usagers = [];
    this.searching = true;
    this.nbResults = 0;

    this.filters = new UsagersFilterCriteria(this.getFilters());

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.titleService.setTitle("Gérer vos domiciliés");

    this.searchString = this.filters.searchString;
    this.filters.page = 0;
    this.filters$.next(this.filters);

    // reload every hour
    this.subscription.add(
      timer(0, AUTO_REFRESH_PERIOD)
        .pipe(
          tap(() => {
            this.loading = true;
          }),
          switchMap(() => this.usagerService.getAllUsagers()),
          retryWhen((errors) =>
            // retry in case of error
            errors.pipe(
              tap((err: HttpErrorResponse) => {
                this.loading = false;
                if (err?.status === 401) {
                  this.authService.logoutAndRedirect();
                } else {
                  console.log(`Error loading usagers`, err);
                  this.notifService.error(
                    "Une erreur a eu lieu lors de la recherche"
                  );
                }
              }),
              // retry in 30 seconds
              delayWhen(() => timer(30000))
            )
          )
        )
        .subscribe((allUsagers: UsagerLight[]) => {
          this.loading = false;
          const usagers = allUsagers.map((usager) => {
            usager.dateToDisplay = getDateToDisplay(usager).dateToDisplay;
            usager.usagerProfilUrl = getUrlUsagerProfil(usager);
            this.updateSortLabel();
            return usager;
          });
          this.allUsagers$.next(usagers);
        })
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
          map((filter: string) => (!filter ? filter : filter.trim())),
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
          tap((filters: UsagersFilterCriteria) => {
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
    this.searchString = null;
    this.filters$.next(this.filters);
  }

  private updateSortLabel() {
    const LABELS_SORT: { [key: string]: string } = {
      NAME: "nom",
      ATTENTE_DECISION: "demande effectuée le",
      ECHEANCE: "échéance",
      INSTRUCTION: "dossier débuté le",
      RADIE: "radié le ",
      REFUS: "date de refus",
      TOUS: "fin de domiciliation",
      VALIDE: "fin de domiciliation",
      PASSAGE: "date de dernier passage",
      ID: "ID",
    };

    if (this.filters.statut === "RADIE") {
      this.echeanceSortLabel = "radiation";
      this.sortLabel = "radiation";
    } else if (this.filters.statut === "REFUS") {
      this.sortLabel = "refus";
      this.echeanceSortLabel = "refus";
    } else {
      this.sortLabel = LABELS_SORT[this.filters.sortKey];
      this.echeanceSortLabel = "échéance";
    }
  }

  public updateFilters<T extends keyof UsagersFilterCriteria>({
    element,
    value,
    sortValue,
  }: {
    element: T;
    value: UsagersFilterCriteria[T] | null;
    sortValue?: UsagersFilterCriteriaSortValues;
  }) {
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
    this.updateSortLabel();
  }

  public applyFilters({
    filters,
    allUsagersByStatus,
  }: {
    filters: UsagersFilterCriteria;
    allUsagersByStatus: UsagersByStatus;
  }) {
    this.searching = true;

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
      this.filters$.next(this.filters);
    }
  }
}
