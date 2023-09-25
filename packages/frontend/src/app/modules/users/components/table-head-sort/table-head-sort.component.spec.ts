import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TableHeadSortComponent } from "./table-head-sort.component";

describe("TableHeadSortComponent", () => {
  let component: TableHeadSortComponent;
  let fixture: ComponentFixture<TableHeadSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableHeadSortComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHeadSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
