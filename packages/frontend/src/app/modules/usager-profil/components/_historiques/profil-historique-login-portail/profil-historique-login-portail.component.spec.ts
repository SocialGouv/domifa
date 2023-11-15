import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueLoginPortailComponent } from "./profil-historique-login-portail.component";

describe("ProfilHistoriqueLoginPortailComponent", () => {
  let component: ProfilHistoriqueLoginPortailComponent;
  let fixture: ComponentFixture<ProfilHistoriqueLoginPortailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueLoginPortailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueLoginPortailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
