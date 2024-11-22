import { Subject, Subscription } from "rxjs";
import {
  ChangeDetectionStrategy,
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

import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortValues,
} from "../usager-filter";
import { Router } from "@angular/router";
import { AuthService } from "../../../shared/services";
import { getUrlUsagerProfil } from "../../../usager-shared/utils";
import { UserStructure } from "@domifa/common";

@Component({
  animations: [fadeInOut],
  selector: "app-manage-manage-usagers-table",
  templateUrl: "./manage-usagers-table.html",
  styleUrls: ["./manage-usagers-table.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageUsagersTableComponent implements OnDestroy, OnInit {
  @Input()
  public usagers!: UsagerFormModel[];

  @Input()
  public filters!: UsagersFilterCriteria;

  @Input()
  public filters$: Subject<UsagersFilterCriteria>;

  @Input()
  public selectAllCheckboxes = false;

  @Input()
  public loading!: boolean;

  @Input() public selectedRefs: Set<number> = new Set();

  @ViewChild("deleteUsagersModal")
  public deleteUsagersModal!: TemplateRef<NgbModalRef>;

  @Output()
  public readonly goToPrint = new EventEmitter<void>();

  @Output()
  public readonly updateFilters = new EventEmitter<{
    element: keyof UsagersFilterCriteria;
    value: UsagersFilterCriteria[keyof UsagersFilterCriteria] | null;
    sortValue?: UsagersFilterCriteriaSortValues;
  }>();

  public me!: UserStructure | null;
  private subscription = new Subscription();
  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;

  constructor(
    private readonly modalService: NgbModal,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.me = this.authService.currentUserValue;
    this.usagers = [];
    this.selectedRefs.clear();
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.filters$.subscribe(() => {
        this.selectAllCheckboxes = false;
        this.selectedRefs.clear();
      })
    );
  }

  public toggleSelection(id: number) {
    if (!this.selectedRefs.size) {
      this.selectAllCheckboxes = false;
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
}
