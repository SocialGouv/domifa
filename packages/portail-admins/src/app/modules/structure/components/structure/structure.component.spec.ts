import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureComponent } from "./structure.component";
import { CommonModule } from "@angular/common";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../../../shared/pipes/sort-array.pipe";
import { AdminStructuresApiClient } from "../../../shared/services";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterModule } from "@angular/router";

describe("StructureComponent", () => {
  let component: StructureComponent;
  let fixture: ComponentFixture<StructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructureComponent],
      imports: [
        CommonModule,
        TableHeadSortComponent,
        SortArrayPipe,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
      providers: [AdminStructuresApiClient],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
