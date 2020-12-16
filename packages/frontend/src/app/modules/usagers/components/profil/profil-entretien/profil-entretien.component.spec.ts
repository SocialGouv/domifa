import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilEntretienComponent } from "./profil-entretien.component";

describe("ProfilEntretienComponent", () => {
  let component: ProfilEntretienComponent;
  let fixture: ComponentFixture<ProfilEntretienComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilEntretienComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilEntretienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
