import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LandingPagePortailComponent } from "./landing-page-portail.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe("LandingPagePortailComponent", () => {
  let component: LandingPagePortailComponent;
  let fixture: ComponentFixture<LandingPagePortailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingPagePortailComponent],
      imports: [RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPagePortailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
