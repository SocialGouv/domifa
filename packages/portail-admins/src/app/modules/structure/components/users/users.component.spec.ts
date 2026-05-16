import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsersComponent } from "./users.component";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { provideMockStore } from "@ngrx/store/testing";
import { UsersTableComponent } from "../../../shared/components/users-table/users-table.component";
import { StructureService } from "../../services/structure.service";
import { STRUCTURE_MOCK } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { CustomToastService } from "../../../shared/services";
import { provideHttpClient } from "@angular/common/http";
import { StructureAdmin } from "@domifa/common";

import { structuresFeature } from "../../../shared/store/structures";

describe("UsersComponent", () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, UsersTableComponent, UsersComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        StructureService,
        CustomToastService,
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
            parent: {
              snapshot: {
                params: {
                  structureId: STRUCTURE_MOCK.id,
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    component.users = [];
    component.structureId = STRUCTURE_MOCK.id;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
