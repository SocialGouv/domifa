import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LandingPagePortailComponent } from "./landing-page-portail.component";

describe("LandingPagePortailComponent", () => {
  let component: LandingPagePortailComponent;
  let fixture: ComponentFixture<LandingPagePortailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingPagePortailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPagePortailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
