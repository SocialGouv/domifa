import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { languagesAutocomplete } from "../../../../shared";
import { ProfilEtatCivilComponent } from "./profil-etat-civil.component";
import { SharedModule } from "../../../shared/shared.module";

describe("ProfilEtatCivilComponent", () => {
  let component: ProfilEtatCivilComponent;
  let fixture: ComponentFixture<ProfilEtatCivilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ProfilEtatCivilComponent],
    });
    fixture = TestBed.createComponent(ProfilEtatCivilComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`languagesAutocomplete has default value`, () => {
    expect(component.languagesAutocomplete).toEqual(languagesAutocomplete);
  });
});
