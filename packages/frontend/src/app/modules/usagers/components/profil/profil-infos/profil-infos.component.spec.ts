import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { languagesAutocomplete } from "../../../../../shared";
import { ProfilInfosComponent } from "./profil-infos.component";
import { SharedModule } from "../../../../shared/shared.module";

describe("ProfilInfosComponent", () => {
  let component: ProfilInfosComponent;
  let fixture: ComponentFixture<ProfilInfosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ProfilInfosComponent],
    });
    fixture = TestBed.createComponent(ProfilInfosComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`languagesAutocomplete has default value`, () => {
    expect(component.languagesAutocomplete).toEqual(languagesAutocomplete);
  });
});
