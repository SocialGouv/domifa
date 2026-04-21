import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayAyantsDroitsComponent } from "./display-ayants-droits.component";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../interfaces";

describe("DisplayAyantsDroitsComponent", () => {
  let component: DisplayAyantsDroitsComponent;
  let fixture: ComponentFixture<DisplayAyantsDroitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayAyantsDroitsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayAyantsDroitsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
