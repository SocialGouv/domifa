import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { DisplayEtatCivilDecisionComponent } from "./display-etat-civil-decision.component";
import { FormatInternationalPhoneNumberPipe } from "../../../usager-shared/formatInternationalPhoneNumber.pipe";

describe("DisplayEtatCivilDecisionComponent", () => {
  let component: DisplayEtatCivilDecisionComponent;
  let fixture: ComponentFixture<DisplayEtatCivilDecisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormatInternationalPhoneNumberPipe],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DisplayEtatCivilDecisionComponent],
    });
    fixture = TestBed.createComponent(DisplayEtatCivilDecisionComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
