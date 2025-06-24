import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  extractDepartmentsFilter,
  StructureFilterCriteria,
  StructureFilterCriteriaSortEnum,
  StructureFilterCriteriaSortKey,
} from "../../utils/structure-filter-criteria";
import { Subscription } from "rxjs";
import {
  DEPARTEMENTS_LISTE,
  DomiciliesSegmentEnum,
  REGIONS_LISTE,
  STRUCTURE_TYPE_LABELS,
} from "@domifa/common";
import { FilterOutput } from "../admin-structures-list/admin-structures-list.component";

@Component({
  selector: "app-structure-filters",
  templateUrl: "./structure-filters.component.html",
  styleUrls: ["../admin-structures-list/admin-structures-list.component.scss"],
})
export class StructureFiltersComponent implements OnInit, OnChanges {
  @Input({ required: true }) public filters: StructureFilterCriteria;
  @Input({ required: true }) public searching: boolean;
  @Input({ required: true }) public nbResults: number;

  @Output() public readonly updateFilters = new EventEmitter<FilterOutput>();

  public structureTypeOptions = STRUCTURE_TYPE_LABELS;
  public segmentUsagersOptions = DomiciliesSegmentEnum;
  public regionTable = REGIONS_LISTE;
  public departmentTable = DEPARTEMENTS_LISTE;
  public sortMenuItems: Array<{
    id: StructureFilterCriteriaSortKey;
    label: string;
  }> = [];

  public subscription: Subscription = new Subscription();

  constructor() {}

  ngOnInit(): void {
    this.sortMenuItems = this.getSortKeys();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.filters &&
      changes.filters.currentValue.region !==
        changes.filters.previousValue?.region
    ) {
      this.departmentTable = extractDepartmentsFilter(
        changes.filters.currentValue.region
      );
    }
    this.sortMenuItems = this.getSortKeys();
  }

  public getSortKeys(): Array<{
    id: StructureFilterCriteriaSortKey;
    label: string;
  }> {
    const sortElements: Array<{
      id: StructureFilterCriteriaSortKey;
      label: string;
    }> = [
      { id: StructureFilterCriteriaSortEnum.ID, label: "ID" },
      { id: StructureFilterCriteriaSortEnum.NOM, label: "Nom" },
      { id: StructureFilterCriteriaSortEnum.TYPE, label: "Type" },
      { id: StructureFilterCriteriaSortEnum.CREATED_AT, label: "Inscrite le" },
      { id: StructureFilterCriteriaSortEnum.IMPORT_AT, label: "Import le" },
      { id: StructureFilterCriteriaSortEnum.USERS, label: "Comptes" },
      { id: StructureFilterCriteriaSortEnum.USAGERS, label: "Dossiers" },
      { id: StructureFilterCriteriaSortEnum.ACTIFS, label: "Actifs" },
      {
        id: StructureFilterCriteriaSortEnum.LAST_LOGIN,
        label: "Dernière connexion",
      },
      { id: StructureFilterCriteriaSortEnum.REGION, label: "Région" },
      { id: StructureFilterCriteriaSortEnum.DEPARTEMENT, label: "Département" },
    ];

    return sortElements;
  }
}
