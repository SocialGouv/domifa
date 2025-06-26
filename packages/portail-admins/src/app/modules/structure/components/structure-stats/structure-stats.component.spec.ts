import { ComponentFixture, TestBed } from "@angular/core/testing";
import { StructureStatsComponent } from "./structure-stats.component";
import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterModule } from "@angular/router";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../../../shared/pipes/sort-array.pipe";
import { StructureService } from "../../services/structure.service";
import { STRUCTURE_MOCK } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { SharedModule } from "../../../shared/shared.module";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

describe("StructureStatsComponent", () => {
  let component: StructureStatsComponent;
  let fixture: ComponentFixture<StructureStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructureStatsComponent],
      imports: [
        CommonModule,
        TableHeadSortComponent,
        SortArrayPipe,
        SharedModule,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [StructureService],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureStatsComponent);
    component = fixture.componentInstance;
    component.structure = STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
