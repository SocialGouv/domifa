import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LandingPagePortailComponent } from "./landing-page-portail.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { APP_BASE_HREF } from "@angular/common";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MATOMO_INJECTORS } from "../../../../../shared";
import { RouterModule } from "@angular/router";

describe("LandingPagePortailComponent", () => {
  let component: LandingPagePortailComponent;
  let fixture: ComponentFixture<LandingPagePortailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingPagePortailComponent],
      imports: [
        RouterModule.forRoot([]),
        NoopAnimationsModule,
        ...MATOMO_INJECTORS,
      ],
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
