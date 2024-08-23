import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  USAGER_VALIDE_MOCK,
  USER_STRUCTURE_MOCK,
} from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { ManageDownloadDocsComponent } from "./manage-download-docs.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { _usagerReducer } from "../../../../shared";
import { StoreModule } from "@ngrx/store";

describe("ManageDownloadDocsComponent", () => {
  let component: ManageDownloadDocsComponent;
  let fixture: ComponentFixture<ManageDownloadDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      declarations: [ManageDownloadDocsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageDownloadDocsComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    component.me.structure = USER_STRUCTURE_MOCK.structure;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
