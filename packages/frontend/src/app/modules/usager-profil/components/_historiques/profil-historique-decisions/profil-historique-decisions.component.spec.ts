import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueDecisionsComponent } from "./profil-historique-decisions.component";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";

describe("ProfilHistoriqueDecisionsComponent", () => {
  let component: ProfilHistoriqueDecisionsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueDecisionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueDecisionsComponent],
      providers: [provideHttpClientTesting(), provideHttpClient()],
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
