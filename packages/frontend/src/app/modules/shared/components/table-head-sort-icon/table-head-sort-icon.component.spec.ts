import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TableHeadSortIconComponent } from "./table-head-sort-icon.component";
import { NgClass, NgIf } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

describe("TableHeadSortIconComponent", () => {
  let component: TableHeadSortIconComponent;
  let fixture: ComponentFixture<TableHeadSortIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgIf, NgClass, FontAwesomeModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(TableHeadSortIconComponent);
    component = fixture.componentInstance;
    component.sortKey = "Nom";
    component.currentKey = "Nom";
    component.sortValue = "asc";
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
