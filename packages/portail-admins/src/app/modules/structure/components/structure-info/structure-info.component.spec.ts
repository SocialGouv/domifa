import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureInfoComponent } from "./structure-info.component";
import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterModule } from "@angular/router";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../../../shared/pipes/sort-array.pipe";
import { StructureService } from "../../services/structure.service";
import { STRUCTURE_MOCK } from "../../STRUCTURE_MOCK.const";
import { FormatInternationalPhoneNumberPipe } from "../../../../shared/utils/formatInternationalPhoneNumber.pipe";

describe("StructureInfoComponent", () => {
  let component: StructureInfoComponent;
  let fixture: ComponentFixture<StructureInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructureInfoComponent],
      imports: [
        CommonModule,
        TableHeadSortComponent,
        SortArrayPipe,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        FormatInternationalPhoneNumberPipe,
      ],
      providers: [StructureService],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureInfoComponent);
    component = fixture.componentInstance;
    component.structure = STRUCTURE_MOCK;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
