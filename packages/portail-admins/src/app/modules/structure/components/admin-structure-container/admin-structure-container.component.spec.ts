import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminStructureContainerComponent } from "./admin-structure-container.component";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { STRUCTURE_MOCK } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { provideMockStore } from "@ngrx/store/testing";
import { StructureAdmin } from "@domifa/common";

import { structuresFeature } from "../../../shared/store/structures";

describe("AdminStructureContainerComponent", () => {
  let component: AdminStructureContainerComponent;
  let fixture: ComponentFixture<AdminStructureContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructureContainerComponent],
      imports: [CommonModule, SharedModule],
      providers: [
        provideRouter([]),
        provideMockStore({
          initialState: {
            [structuresFeature.name]: {
              list: [STRUCTURE_MOCK as unknown as StructureAdmin],
              loading: false,
              loaded: true,
              error: null,
            },
          },
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { structureId: STRUCTURE_MOCK.id },
            },
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminStructureContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
