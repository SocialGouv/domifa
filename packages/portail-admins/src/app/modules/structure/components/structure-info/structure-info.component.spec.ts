import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureInfoComponent } from "./structure-info.component";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../../../shared/pipes/sort-array.pipe";
import { StructureService } from "../../services/structure.service";
import { STRUCTURE_MOCK } from "../../../../mocks/STRUCTURE_MOCK.mock";
import { FormatInternationalPhoneNumberPipe } from "../../../../shared/utils/formatInternationalPhoneNumber.pipe";
import { provideHttpClient } from "@angular/common/http";
import { appStore } from "../../../shared/store/appStore.service";
import { StructureAdmin } from "@domifa/common";

describe("StructureInfoComponent", () => {
  let component: StructureInfoComponent;
  let fixture: ComponentFixture<StructureInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructureInfoComponent],
      imports: [
        CommonModule,
        TableHeadSortComponent,
        SortArrayPipe,
        RouterModule.forRoot([]),
        FormatInternationalPhoneNumberPipe,
      ],
      providers: [
        provideHttpClient(),
        StructureService,
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
    }).compileComponents();
    jest.spyOn(appStore, "getState").mockReturnValue({
      structureListData: [STRUCTURE_MOCK as unknown as StructureAdmin],
    });
    fixture = TestBed.createComponent(StructureInfoComponent);
    component = fixture.componentInstance;
    component.structure = STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
