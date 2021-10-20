import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { languagesAutocomplete } from "../../../../shared";
import { DisplayEtatCivilDecisionComponent } from "./display-etat-civil-decision.component";
import { SharedModule } from "../../../shared/shared.module";

describe("DisplayEtatCivilDecisionComponent", () => {
  let component: DisplayEtatCivilDecisionComponent;
  let fixture: ComponentFixture<DisplayEtatCivilDecisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DisplayEtatCivilDecisionComponent],
    });
    fixture = TestBed.createComponent(DisplayEtatCivilDecisionComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`languagesAutocomplete has default value`, () => {
    expect(component.languagesAutocomplete).toEqual(languagesAutocomplete);
  });
});
