import { Subject, Subscription, takeUntil } from "rxjs";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import {
  DEFAULT_MODAL_OPTIONS,
  ETAPES_DEMANDE_URL,
} from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagersFilterCriteria } from "../usager-filter";
import { Router } from "@angular/router";
import { AuthService } from "../../../shared/services";
import { getUrlUsagerProfil } from "../../../usager-shared/utils";
import {
  SortValues,
  UsagersFilterCriteriaStatut,
  UserStructure,
} from "@domifa/common";
import {
  faArrowDown,
  faArrowUp,
  faSort,
} from "@fortawesome/free-solid-svg-icons";

@Component({
  animations: [fadeInOut],
  selector: "app-manage-manage-usagers-table",
  templateUrl: "./manage-usagers-table.html",
  styleUrls: ["./manage-usagers-table.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageUsagersTableComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  public usagers!: UsagerFormModel[];
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true })
  public filters!: UsagersFilterCriteria;

  @Input({ required: true }) filters$!: Subject<UsagersFilterCriteria>;

  @Input({ required: true })
  public selectAllCheckboxes = false;

  @Output()
  public readonly selectAllCheckboxesChange = new EventEmitter<boolean>();

  @Input({ required: true })
  public selectedRefs: Set<number> = new Set();

  @ViewChild("deleteUsagersModal")
  public deleteUsagersModal!: TemplateRef<NgbModalRef>;

  @ViewChild("assignReferrersModal")
  public assignReferrersModal!: TemplateRef<NgbModalRef>;

  @Output()
  public readonly goToPrint = new EventEmitter<void>();

  @Output()
  public readonly updateFilters = new EventEmitter<{
    element: keyof UsagersFilterCriteria;
    value: UsagersFilterCriteria[keyof UsagersFilterCriteria] | null;
    sortValue?: SortValues;
  }>();

  public me!: UserStructure | null;
  private readonly subscription = new Subscription();
  public showCheckboxes = false;
  public currentFilters!: UsagersFilterCriteria;

  public loading = false;
  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;
  public readonly UsagersFilterCriteriaStatut = UsagersFilterCriteriaStatut;

  public readonly faArrowDown = faArrowDown;
  public readonly faArrowUp = faArrowUp;
  public readonly faSort = faSort;
  public readonly ARIA_SORT: {
    [key in SortValues]: string;
  } = {
    asc: "ascending",
    desc: "descending",
  };
  constructor(
    private readonly modalService: NgbModal,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.me = this.authService.currentUserValue;
    this.usagers = [];
    this.selectedRefs.clear();
  }

  ngOnInit() {
    this.filters$.pipe(takeUntil(this.destroy$)).subscribe((filters) => {
      this.currentFilters = filters;
      this.computeCheckboxVisibility();
      this.selectAllCheckboxes = false;
      this.selectedRefs.clear();
      this.cd.markForCheck();
    });
  }

  private computeCheckboxVisibility() {
    if (this.me.role === "admin" || this.me.role === "responsable") {
      this.showCheckboxes = true;
      return;
    }

    if (this.me.role === "facteur") {
      this.showCheckboxes = false;
      return;
    }

    if (this.me.role === "simple") {
      this.showCheckboxes =
        this.currentFilters.statut === UsagersFilterCriteriaStatut.VALIDE;
      return;
    }

    this.showCheckboxes = false;

    this.cd.markForCheck();
  }

  public toggleSelection(id: number) {
    if (!this.selectedRefs.size) {
      this.selectAllCheckboxesChange.emit(false);
    }

    if (!this.selectedRefs.has(id)) {
      this.selectedRefs.add(id);
    } else {
      this.selectedRefs.delete(id);
    }
  }

  public openDeleteUsagersModal(): void {
    this.modalService.open(this.deleteUsagersModal, DEFAULT_MODAL_OPTIONS);
  }

  public openAssignReferrerModal(): void {
    this.modalService.open(this.assignReferrersModal, DEFAULT_MODAL_OPTIONS);
  }

  public goToProfil(usager: UsagerFormModel): void {
    const url =
      this.me.role === "facteur"
        ? `/profil/general/${usager.ref}`
        : getUrlUsagerProfil(usager);

    this.router.navigate([url]);
  }

  public refTrackBy(_index: number, item: UsagerFormModel) {
    return item.ref;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getVisibleCheckboxIds(): void {
    const checkboxes = document.querySelectorAll(
      'table input[type="checkbox"]'
    );
    const viewportHeight = window.innerHeight;
    const visibleIds: number[] = [];
    const selectIdPattern = /^select-/;

    checkboxes.forEach((checkbox: Element) => {
      if (
        checkbox instanceof HTMLInputElement &&
        selectIdPattern.test(checkbox.id)
      ) {
        const rect = checkbox.getBoundingClientRect();

        if (rect.top >= 0 && rect.bottom <= viewportHeight) {
          const id = checkbox.id?.replace("select-", "");
          if (id) {
            visibleIds.push(parseInt(id, 10));
          }
        }
      }
    });

    if (!this.selectAllCheckboxes) {
      this.selectedRefs.clear();
    } else {
      visibleIds.forEach((id) => {
        if (!this.selectedRefs.has(id)) {
          this.selectedRefs.add(id);
        }
      });
    }
  }

  public resetCheckboxes() {
    this.selectAllCheckboxesChange.emit(false);
    this.selectAllCheckboxes = false;
    this.selectedRefs.clear();
    this.modalService.dismissAll();
  }
}
