import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilEditPreferenceComponent } from "./profil-edit-preference.component";

describe("ProfilEditPreferenceComponent", () => {
  let component: ProfilEditPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilEditPreferenceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilEditPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
