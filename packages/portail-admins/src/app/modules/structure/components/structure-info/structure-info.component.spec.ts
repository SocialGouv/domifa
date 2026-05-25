import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureInfoComponent } from "./structure-info.component";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { provideMockStore } from "@ngrx/store/testing";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../../../shared/pipes/sort-array.pipe";
import { StructureService } from "../../services/structure.service";
import { STRUCTURE_MOCK } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { FormatInternationalPhoneNumberPipe } from "../../../../shared/utils/formatInternationalPhoneNumber.pipe";
import { provideHttpClient } from "@angular/common/http";
import { StructureAdmin } from "@domifa/common";

import { structuresFeature } from "../../../shared/store/structures";
import { AdminStructuresApiClient } from "../../../shared/services/api";

describe("StructureInfoComponent", () => {
  let component: StructureInfoComponent;
  let fixture: ComponentFixture<StructureInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TableHeadSortComponent,
        SortArrayPipe,
        FormatInternationalPhoneNumberPipe,
        StructureInfoComponent,
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        StructureService,
        AdminStructuresApiClient,
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
                params: { structureUuid: STRUCTURE_MOCK.uuid },
              },
            },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StructureInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
