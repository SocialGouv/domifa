import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  StructureFilterCriteria,
  StructureFilterCriteriaSortEnum,
} from "../../utils/structure-filter-criteria";
import { Subscription } from "rxjs";
import {
  DEPARTEMENTS_LISTE,
  DomiciliesSegmentEnum,
  RegionDef,
  REGIONS_DEF,
  REGIONS_LISTE,
  RegionsLabels,
  STRUCTURE_TYPE_LABELS,
} from "@domifa/common";
import { FilterOutput } from "../admin-structures-list/admin-structures-list.component";

@Component({
  selector: "app-structure-filters",
  templateUrl: "./structure-filters.component.html",
  styleUrls: ["../admin-structures-list/admin-structures-list.component.scss"],
})
export class StructureFiltersComponent implements OnChanges {
  @Input({ required: true }) public filters: StructureFilterCriteria;
  @Input({ required: true }) public searching: boolean;
  @Input({ required: true }) public nbResults: number;

  @Output() public readonly updateFilters = new EventEmitter<FilterOutput>();

  public structureTypeOptions = STRUCTURE_TYPE_LABELS;
  public segmentUsagersOptions = DomiciliesSegmentEnum;
  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public DEPARTEMENTS_LISTE = { ...DEPARTEMENTS_LISTE };
  public sortMenuItems: Array<{
    id: StructureFilterCriteriaSortEnum;
    label: string;
  }> = [];

  public subscription: Subscription = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.filters &&
      changes.filters.currentValue.region !==
        changes.filters.previousValue?.region
    ) {
      this.DEPARTEMENTS_LISTE = this.getDepartmentsWithFilter(
        changes.filters.currentValue?.region
      );
    }
  }

  public getDepartmentsWithFilter = (region?: string): RegionsLabels => {
    if (!region) {
      return { ...DEPARTEMENTS_LISTE };
    }
    return REGIONS_DEF.find(
      (r: RegionDef) => r.regionCode === region
    )?.departements.reduce<RegionsLabels>((acc, dep) => {
      acc[dep.departmentCode] = dep.departmentName;
      return acc;
    }, {});
  };

  public onStructureTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateFilters.emit({
      element: "structureType",
      value: target.value,
      sortValue: this.filters.sortValue,
    });
  }

  public onRegionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateFilters.emit({
      element: "region",
      value: target.value,
      sortValue: this.filters.sortValue,
    });
  }

  public onDepartementChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateFilters.emit({
      element: "departement",
      value: target.value,
      sortValue: this.filters.sortValue,
    });
  }

  public onDomicilieSegmentChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateFilters.emit({
      element: "domicilieSegment",
      value: target.value,
      sortValue: this.filters.sortValue,
    });
  }
}
