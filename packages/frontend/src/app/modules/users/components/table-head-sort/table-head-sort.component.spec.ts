import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TableHeadSortComponent } from "./table-head-sort.component";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

describe("TableHeadSortComponent", () => {
  let component: TableHeadSortComponent;
  let fixture: ComponentFixture<TableHeadSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableHeadSortComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHeadSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
