import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueDecisionsComponent } from "./profil-historique-decisions.component";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";

describe("ProfilHistoriqueDecisionsComponent", () => {
  let component: ProfilHistoriqueDecisionsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueDecisionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueDecisionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueDecisionsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
