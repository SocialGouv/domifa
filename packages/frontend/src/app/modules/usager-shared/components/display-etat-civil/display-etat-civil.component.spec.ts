import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { languagesAutocomplete } from "../../../../shared";
import { DisplayEtatCivilComponent } from "./display-etat-civil.component";
import { SharedModule } from "../../../shared/shared.module";

describe("DisplayEtatCivilComponent", () => {
  let component: DisplayEtatCivilComponent;
  let fixture: ComponentFixture<DisplayEtatCivilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DisplayEtatCivilComponent],
    });
    fixture = TestBed.createComponent(DisplayEtatCivilComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`languagesAutocomplete has default value`, () => {
    expect(component.languagesAutocomplete).toEqual(languagesAutocomplete);
  });
});
