import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditUsagerDocComponent } from "./edit-usager-doc.component";
import { provideHttpClient } from "@angular/common/http";
import { SharedModule } from "../../../shared/shared.module";

describe("EditUsagerDocComponent", () => {
  let component: EditUsagerDocComponent;
  let fixture: ComponentFixture<EditUsagerDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditUsagerDocComponent],
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(EditUsagerDocComponent);
    component = fixture.componentInstance;
    component.doc = {
      uuid: "82b484ba-1335-4344-85b1-68ac5660f4f6",
      createdAt: new Date("2024-10-29T21:35:12.143Z"),
      label: "LABEL",
      filetype: "image/jpeg",
      createdBy: "Team",
      shared: false,
      loading: true,
      usagerUUID: "",
      path: "",
      structureId: 0,
      usagerRef: 1,
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
