import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TableHeadSortComponent } from "./table-head-sort.component";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { NgIf, NgClass } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

describe("TableHeadSortComponent", () => {
  let component: TableHeadSortComponent;
  let fixture: ComponentFixture<TableHeadSortComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgIf, NgClass, FontAwesomeModule],
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
