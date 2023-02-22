import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  USAGER_ACTIF_MOCK,
  USER_STRUCTURE_MOCK,
} from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { ManageDownloadDocsComponent } from "./manage-download-docs.component";

describe("ManageDownloadDocsComponent", () => {
  let component: ManageDownloadDocsComponent;
  let fixture: ComponentFixture<ManageDownloadDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ManageDownloadDocsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageDownloadDocsComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    component.me.structure = USER_STRUCTURE_MOCK.structure;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
