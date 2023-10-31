import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueDecisionsComponent } from "./profil-historique-decisions.component";

describe("ProfilHistoriqueDecisionsComponent", () => {
  let component: ProfilHistoriqueDecisionsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueDecisionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueDecisionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueDecisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
