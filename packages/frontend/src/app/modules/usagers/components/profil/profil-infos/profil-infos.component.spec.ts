import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilInfosComponent } from "./profil-infos.component";

describe("ProfilInfosComponent", () => {
  let component: ProfilInfosComponent;
  let fixture: ComponentFixture<ProfilInfosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilInfosComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
