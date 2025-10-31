import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminStructureContainerComponent } from "./admin-structure-container.component";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { STRUCTURE_MOCK } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

describe("AdminStructureContainerComponent", () => {
  let component: AdminStructureContainerComponent;
  let fixture: ComponentFixture<AdminStructureContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructureContainerComponent],
      imports: [CommonModule, SharedModule, RouterModule.forChild([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                structure: STRUCTURE_MOCK,
              },
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
