import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { ProfilEntretienComponent } from "./profil-entretien.component";

describe("ProfilEntretienComponent", () => {
  let component: ProfilEntretienComponent;
  let fixture: ComponentFixture<ProfilEntretienComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ProfilEntretienComponent],
    });
    fixture = TestBed.createComponent(ProfilEntretienComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
