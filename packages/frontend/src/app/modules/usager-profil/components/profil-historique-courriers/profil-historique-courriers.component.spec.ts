import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueCourriersComponent } from "./profil-historique-courriers.component";

describe("ProfilHistoriqueCourriersComponent", () => {
  let component: ProfilHistoriqueCourriersComponent;
  let fixture: ComponentFixture<ProfilHistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueCourriersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
