import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import * as USAGERS_LABELS from "../../../../shared/constants/USAGER_LABELS.const";

import { DisplayEntretienComponent } from "./display-entretien.component";

describe("DisplayEntretienComponent", () => {
  let component: DisplayEntretienComponent;
  let fixture: ComponentFixture<DisplayEntretienComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DisplayEntretienComponent],
    });
    fixture = TestBed.createComponent(DisplayEntretienComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`labels has default value`, () => {
    expect(component.labels).toEqual(USAGERS_LABELS);
  });
});
