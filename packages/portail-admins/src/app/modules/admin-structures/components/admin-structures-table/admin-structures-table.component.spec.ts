import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminStructuresTableComponent } from "./admin-structures-table.component";
import { AdminStructuresModule } from "../../admin-structures.module";
import { provideRouter } from "@angular/router";
import { StructureFilterCriteria } from "../../utils/structure-filter-criteria";
import { provideHttpClient } from "@angular/common/http";
import { provideMockStore } from "@ngrx/store/testing";

describe("AdminStructuresTableComponent", () => {
  let component: AdminStructuresTableComponent;
  let fixture: ComponentFixture<AdminStructuresTableComponent>;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [AdminStructuresModule, AdminStructuresTableComponent],
      providers: [provideRouter([]), provideHttpClient(), provideMockStore({})],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStructuresTableComponent);

    component = fixture.componentInstance;

    component.structures = [];
    component.filters = new StructureFilterCriteria();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
