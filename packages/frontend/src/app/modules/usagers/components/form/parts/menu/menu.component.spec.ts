import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { MenuComponent } from "./menu.component";

describe("MenuComponent", () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [MenuComponent],
    });
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`etapes has default value`, () => {
    expect(component.etapes).toEqual([
      `État civil`,
      `Prise de RDV`,
      `Entretien`,
      `Pièces justificatives`,
      `Décision finale`,
    ]);
  });

  it(`etapesUrl has default value`, () => {
    expect(component.etapesUrl).toEqual([
      `etat-civil`,
      `rendez-vous`,
      `entretien`,
      `documents`,
      `decision`,
    ]);
  });
});
