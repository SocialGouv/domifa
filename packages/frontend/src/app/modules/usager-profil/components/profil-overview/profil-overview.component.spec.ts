import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilOverviewComponent } from "./profil-overview.component";

describe("ProfilOverviewComponent", () => {
  let component: ProfilOverviewComponent;
  let fixture: ComponentFixture<ProfilOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilOverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
